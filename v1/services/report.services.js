import Position from '../models/position.model.js';
import { analyzePortfolioNewsService } from './groq.services.js';
import { daysAgo, monthOf, toIsoDate } from '../utils/date.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { round, toPercentage } from '../utils/math.js';
import {
  buildAllocation,
  buildComposition,
  buildPositionRow,
  buildTotals,
  byBankAccount,
  byInstrument,
  byInstrumentType,
  createReport,
  toClientSummary,
} from '../utils/reportHelpers.js';

const REPORT_TYPES = {
  clientFull: 'client-full',
  clientInstrument: 'client-instrument',
  clientIssuer: 'client-issuer',
  clientComposition: 'client-composition',
  clientHistoric: 'client-historic',
  clientNews: 'client-news',
};

// The news report only analyzes the client's largest positions, to keep the AI request small
const NEWS_TOP_POSITIONS = 3;

// @TODO definir
// Every amount is treated as USD for now
// All client reports but the historic one only use the latest positions: the most recent report of
// each holding, as long as it was reported within the last LATEST_REPORT_DAYS.
const LATEST_REPORT_DAYS = 30;

const getReportWindow = () => ({
  from: toIsoDate(daysAgo(LATEST_REPORT_DAYS)),
  to: toIsoDate(new Date()),
});

// for client
export const ClientFullReport = async (client, user) => {
  const rows = await findLatestPositionRows(client);
  const totals = buildTotals(rows);

  return createReport(user, REPORT_TYPES.clientFull, {
    client: toClientSummary(client),
    reportWindow: getReportWindow(),
    positions: rows,
    totals,
    composition: buildComposition(rows, totals.marketValue),
  });
};

// by intruments
export const ClientInstrumentReport = async (client, instrument, user) => {
  const rows = await findLatestPositionRows(client);
  const portfolioTotals = buildTotals(rows);
  const instrumentRows = rows.filter((row) => row.instrument?.id === instrument.id);
  const totals = buildTotals(instrumentRows);

  return createReport(user, REPORT_TYPES.clientInstrument, {
    client: toClientSummary(client),
    reportWindow: getReportWindow(),
    instrument: { id: instrument.id, name: instrument.name, type: instrument.type },
    positions: instrumentRows,
    totals,
    portfolioPercentage: toPercentage(totals.marketValue, portfolioTotals.marketValue),
    byBankAccount: buildAllocation(instrumentRows, totals.marketValue, byBankAccount),
  });
};

// by issuer
export const ClientIssuerReport = async (client, issuer, user) => {
  const rows = await findLatestPositionRows(client);
  const portfolioTotals = buildTotals(rows);
  const issuerRows = rows.filter((row) => row.issuer?.id === issuer.id);
  const totals = buildTotals(issuerRows);

  return createReport(user, REPORT_TYPES.clientIssuer, {
    client: toClientSummary(client),
    reportWindow: getReportWindow(),
    issuer: { id: issuer.id, name: issuer.commercialName },
    positions: issuerRows,
    totals,
    portfolioPercentage: toPercentage(totals.marketValue, portfolioTotals.marketValue),
    byInstrument: buildAllocation(issuerRows, totals.marketValue, byInstrument),
  });
};

// composition
export const ClientCompositionReport = async (client, user) => {
  const rows = await findLatestPositionRows(client);
  const totals = buildTotals(rows);

  return createReport(user, REPORT_TYPES.clientComposition, {
    client: toClientSummary(client),
    reportWindow: getReportWindow(),
    totals,
    composition: buildComposition(rows, totals.marketValue),
  });
};

// historic
export const ClientHistoricReport = async (client, user) => {
  const rows = await findMonthlyPositionRows(client);

  const rowsByMonth = new Map();
  for (const row of rows) {
    const period = monthOf(row.dateOfReport);
    rowsByMonth.set(period, [...(rowsByMonth.get(period) ?? []), row]);
  }

  let previous = null;
  const months = [...rowsByMonth.keys()].sort().map((period) => {
    const monthRows = rowsByMonth.get(period);
    const totals = buildTotals(monthRows);
    const marketValueChange = previous ? round(totals.marketValue - previous.marketValue) : null;
    const month = {
      period,
      totals,
      marketValueChange,
      marketValueChangePercentage:
        previous ? toPercentage(marketValueChange, previous.marketValue) : null,
      byInstrumentType: buildAllocation(monthRows, totals.marketValue, byInstrumentType),
    };
    previous = totals;
    return month;
  });

  return createReport(user, REPORT_TYPES.clientHistoric, {
    client: toClientSummary(client),
    months,
  });
};

// news: AI analysis of recent news on the client's largest positions
export const ClientNewsReport = async (client, user, language) => {
  const rows = await findLatestPositionRows(client);
  if (rows.length === 0) throw httpError(ERRORS.noRecentPositions);

  const totals = buildTotals(rows);
  // Cash can rank among the top positions and the model will then search news for it, which
  // spends a search on nothing useful. Filtering out type 'cash' here would avoid it; left as is
  // for now so the percentages match the composition report.
  const topPositions = buildAllocation(rows, totals.marketValue, byInstrument).slice(
    0,
    NEWS_TOP_POSITIONS,
  );
  const news = await analyzePortfolioNewsService(topPositions, language);

  return createReport(user, REPORT_TYPES.clientNews, {
    client: toClientSummary(client),
    reportWindow: getReportWindow(),
    portfolio: { totalMarketValue: totals.marketValue, topPositions },
    ...news,
  });
};

// for advisor
// top clients in portfolio volume and markey value
// top manager in portfolio volume and market value

// for admin
// logs
// advisor activity overview
// advisor data overview (clients remain private?)

const findPositions = (client, filters = {}) =>
  Position.find({ clientId: client._id, isDeleted: false, ...filters })
    .populate('instrumentId', 'name type isin ticker')
    .populate('issuerId', 'commercialName');

const toPositionRows = (client, positions) =>
  positions.map((position) =>
    buildPositionRow(position, client.bankAccounts.id(position.bankAccountId)),
  );

// A bank reports the same holding (one instrument in one bank account) again on every statement,
// so a holding has many Position documents over its life; populated() gives back the raw id
const holdingKey = (position) =>
  `${position.bankAccountId}:${position.populated('instrumentId') ?? position.instrumentId}`;

// Newest first, so the first document seen for each key is the latest report
const findLatestPositions = async (client, filters, keyOf) => {
  const positions = await findPositions(client, filters).sort({ dateOfReport: -1, createdAt: -1 });

  const latest = new Map();
  for (const position of positions) {
    const key = keyOf(position);
    if (!latest.has(key)) latest.set(key, position);
  }
  return [...latest.values()];
};

const findLatestPositionRows = async (client) =>
  toPositionRows(
    client,
    await findLatestPositions(
      client,
      { dateOfReport: { $gte: daysAgo(LATEST_REPORT_DAYS) } },
      holdingKey,
    ),
  );

// Latest report of each holding within each month
const findMonthlyPositionRows = async (client) =>
  toPositionRows(
    client,
    await findLatestPositions(
      client,
      {},
      (position) => `${monthOf(position.dateOfReport)}:${holdingKey(position)}`,
    ),
  );
