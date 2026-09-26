import Position from '../models/position.model.js';

const REPORT_TYPES = {
  clientFull: 'client-full',
  clientInstrument: 'client-instrument',
  clientIssuer: 'client-issuer',
  clientComposition: 'client-composition',
  clientHistoric: 'client-historic',
};

// Every amount is treated as USD for now; currencies are not converted or split yet.
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

// One entry per reported month, oldest first, with the change in market value from the month before
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

const createReport = (user, reportType, data) => {
  const report = {
    date: new Date(),
    requestingUser: user,
    reportType,
    data,
  };

  return report;
};

const getMarketValue = (position) =>
  position.quantity * (position.currentPrice ?? position.purchasePrice);

const getCostOnPurchase = (position) => position.quantity * position.purchasePrice;

const getUnrealized = (position) => getMarketValue(position) - getCostOnPurchase(position);

// Months are taken in UTC, as 'YYYY-MM'
const monthOf = (date) => date.toISOString().slice(0, 7);

const currentMonthFilter = () => {
  const now = new Date();
  return {
    $gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    $lt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  };
};

const findPositionRows = async (client, filters = {}) => {
  const positions = await Position.find({ clientId: client._id, isDeleted: false, ...filters })
    .populate('instrumentId', 'name type')
    .populate('issuerId', 'commercialName');

  return positions.map((position) =>
    buildPositionRow(position, client.bankAccounts.id(position.bankAccountId)),
  );
};

const toClientSummary = (client) => ({
  id: client.id,
  commercialName: client.clientDetails.commercialName,
  legalName: client.clientDetails.legalName,
});

// Rounds to cents so float noise (e.g. 0.30000000000000004) doesn't reach the response
const round = (value) => Math.round(value * 100) / 100;

const toPercentage = (part, total) => (total === 0 ? 0 : round((part / total) * 100));

const buildPositionRow = (position, bankAccount) => {
  const costOnPurchase = getCostOnPurchase(position);
  const unrealized = getUnrealized(position);
  const instrument = position.instrumentId;
  const issuer = position.issuerId;

  return {
    positionId: position.id,
    instrument:
      instrument ? { id: instrument.id, name: instrument.name, type: instrument.type } : null,
    issuer: issuer ? { id: issuer.id, name: issuer.commercialName } : null,
    bankAccount:
      bankAccount ?
        { id: bankAccount.id, number: bankAccount.number, accountName: bankAccount.accountName }
      : null,
    currency: position.currency,
    quantity: position.quantity,
    purchasePrice: position.purchasePrice,
    currentPrice: position.currentPrice ?? position.purchasePrice,
    costOnPurchase: round(costOnPurchase),
    marketValue: round(getMarketValue(position)),
    unrealized: round(unrealized),
    unrealizedPercentage: toPercentage(unrealized, costOnPurchase),
    dateOfPurchase: position.dateOfPurchase,
    dateOfReport: position.dateOfReport,
  };
};

// Groups rows by getGroup's key and gives each group's share of the total market value, largest first
const buildAllocation = (rows, totalMarketValue, getGroup) => {
  const groups = new Map();
  for (const row of rows) {
    const { key, ...label } = getGroup(row);
    const group = groups.get(key) ?? { ...label, marketValue: 0 };
    group.marketValue += row.marketValue;
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      marketValue: round(group.marketValue),
      percentage: toPercentage(group.marketValue, totalMarketValue),
    }))
    .sort((a, b) => b.marketValue - a.marketValue);
};

const byInstrument = (row) => ({
  key: row.instrument?.id ?? 'unknown',
  id: row.instrument?.id ?? null,
  name: row.instrument?.name ?? 'Unknown instrument',
});

const byInstrumentType = (row) => ({
  key: row.instrument?.type ?? 'unknown',
  type: row.instrument?.type ?? 'unknown',
});

// Funds and cash have no issuer, so they are grouped together
const byIssuer = (row) => ({
  key: row.issuer?.id ?? 'none',
  id: row.issuer?.id ?? null,
  name: row.issuer?.name ?? 'No issuer',
});

const byBankAccount = (row) => ({
  key: row.bankAccount?.id ?? 'unknown',
  id: row.bankAccount?.id ?? null,
  number: row.bankAccount?.number ?? null,
  accountName: row.bankAccount?.accountName ?? 'Unknown account',
});

const buildTotals = (rows) => {
  const costOnPurchase = rows.reduce((sum, row) => sum + row.costOnPurchase, 0);
  const marketValue = rows.reduce((sum, row) => sum + row.marketValue, 0);
  const unrealized = marketValue - costOnPurchase;

  return {
    positionCount: rows.length,
    costOnPurchase: round(costOnPurchase),
    marketValue: round(marketValue),
    unrealized: round(unrealized),
    unrealizedPercentage: toPercentage(unrealized, costOnPurchase),
  };
};

const buildComposition = (rows, totalMarketValue) => ({
  byInstrumentType: buildAllocation(rows, totalMarketValue, byInstrumentType),
  byInstrument: buildAllocation(rows, totalMarketValue, byInstrument),
  byIssuer: buildAllocation(rows, totalMarketValue, byIssuer),
});
