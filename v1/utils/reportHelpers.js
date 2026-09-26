import { getCostOnPurchase, getMarketValue, getUnrealized, round, toPercentage, toPercentages } from './math.js';

export const createReport = (user, reportType, data) => {
  const report = {
    date: new Date(),
    requestingUser: user,
    reportType,
    data,
  };

  return report;
};

export const toClientSummary = (client) => ({
  id: client.id,
  commercialName: client.clientDetails.commercialName,
  legalName: client.clientDetails.legalName,
});

export const buildPositionRow = (position, bankAccount) => {
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

export const buildAllocation = (rows, totalMarketValue, getGroup) => {
  const groups = new Map();
  for (const row of rows) {
    const { key, ...label } = getGroup(row);
    const group = groups.get(key) ?? { ...label, marketValue: 0 };
    group.marketValue += row.marketValue;
    groups.set(key, group);
  }
  const values = [...groups.values()];
  const percentages = toPercentages(
    values.map((group) => group.marketValue),
    totalMarketValue,
  );
  return values
    .map((group, index) => ({
      ...group,
      marketValue: round(group.marketValue),
      percentage: percentages[index],
    }))
    .sort((a, b) => b.marketValue - a.marketValue);
};

export const byInstrument = (row) => ({
  key: row.instrument?.id ?? 'unknown',
  id: row.instrument?.id ?? null,
  name: row.instrument?.name ?? 'Unknown instrument',
});

export const byInstrumentType = (row) => ({
  key: row.instrument?.type ?? 'unknown',
  type: row.instrument?.type ?? 'unknown',
});

export const byIssuer = (row) => ({
  key: row.issuer?.id ?? 'none',
  id: row.issuer?.id ?? null,
  name: row.issuer?.name ?? 'No issuer',
});

export const byBankAccount = (row) => ({
  key: row.bankAccount?.id ?? 'unknown',
  id: row.bankAccount?.id ?? null,
  number: row.bankAccount?.number ?? null,
  accountName: row.bankAccount?.accountName ?? 'Unknown account',
});

export const buildTotals = (rows) => {
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

export const buildComposition = (rows, totalMarketValue) => ({
  byInstrumentType: buildAllocation(rows, totalMarketValue, byInstrumentType),
  byInstrument: buildAllocation(rows, totalMarketValue, byInstrument),
  byIssuer: buildAllocation(rows, totalMarketValue, byIssuer),
});
