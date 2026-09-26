import Position from '../models/position.model.js';
import { currentMonthFilter, monthOf } from '../utils/date.js';
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
};

// @TODO definir
// Every amount is treated as USD for now
// All client reports but the historic one only use the latest positions: those reported this month.

// for client
export const ClientFullReport = async (client, user) => {
  const rows = await findPositionRows(client, { dateOfReport: currentMonthFilter() });
  const totals = buildTotals(rows);

  return createReport(user, REPORT_TYPES.clientFull, {
    client: toClientSummary(client),
    period: monthOf(new Date()),
    positions: rows,
    totals,
    composition: buildComposition(rows, totals.marketValue),
  });
};

// by intruments
export const ClientInstrumentReport = async (client, instrument, user) => {
  const rows = await findPositionRows(client, { dateOfReport: currentMonthFilter() });
  const portfolioTotals = buildTotals(rows);
  const instrumentRows = rows.filter((row) => row.instrument?.id === instrument.id);
  const totals = buildTotals(instrumentRows);

  return createReport(user, REPORT_TYPES.clientInstrument, {
    client: toClientSummary(client),
    period: monthOf(new Date()),
    instrument: { id: instrument.id, name: instrument.name, type: instrument.type },
    positions: instrumentRows,
    totals,
    portfolioPercentage: toPercentage(totals.marketValue, portfolioTotals.marketValue),
    byBankAccount: buildAllocation(instrumentRows, totals.marketValue, byBankAccount),
  });
};

// by issuer
export const ClientIssuerReport = async (client, issuer, user) => {
  const rows = await findPositionRows(client, { dateOfReport: currentMonthFilter() });
  const portfolioTotals = buildTotals(rows);
  const issuerRows = rows.filter((row) => row.issuer?.id === issuer.id);
  const totals = buildTotals(issuerRows);

  return createReport(user, REPORT_TYPES.clientIssuer, {
    client: toClientSummary(client),
    period: monthOf(new Date()),
    issuer: { id: issuer.id, name: issuer.commercialName },
    positions: issuerRows,
    totals,
    portfolioPercentage: toPercentage(totals.marketValue, portfolioTotals.marketValue),
    byInstrument: buildAllocation(issuerRows, totals.marketValue, byInstrument),
  });
};

// composition
export const ClientCompositionReport = async (client, user) => {
  const rows = await findPositionRows(client, { dateOfReport: currentMonthFilter() });
  const totals = buildTotals(rows);

  return createReport(user, REPORT_TYPES.clientComposition, {
    client: toClientSummary(client),
    period: monthOf(new Date()),
    totals,
    composition: buildComposition(rows, totals.marketValue),
  });
};

// historic
export const ClientHistoricReport = async (client, user) => {
  const rows = await findPositionRows(client);

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

// ia assestment

// for advisor
// top clients in portfolio volume and markey value
// top manager in portfolio volume and market value

// for admin
// logs
// advisor activity overview
// advisor data overview (clients remain private?)

const findPositionRows = async (client, filters = {}) => {
  const positions = await Position.find({ clientId: client._id, isDeleted: false, ...filters })
    .populate('instrumentId', 'name type')
    .populate('issuerId', 'commercialName');

  return positions.map((position) =>
    buildPositionRow(position, client.bankAccounts.id(position.bankAccountId)),
  );
};
