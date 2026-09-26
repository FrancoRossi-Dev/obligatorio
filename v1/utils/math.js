export const round = (value) => Math.round(value * 100) / 100;

export const toPercentage = (part, total) => (total === 0 ? 0 : round((part / total) * 100));

// Largest remainder method: rounds each share so the set still adds up to the rounded total
export const toPercentages = (parts, total) => {
  if (total === 0) return parts.map(() => 0);
  const hundredths = parts.map((part) => (part / total) * 10000);
  const floored = hundredths.map(Math.floor);
  const target = Math.round(hundredths.reduce((sum, value) => sum + value, 0));
  let leftover = target - floored.reduce((sum, value) => sum + value, 0);
  const byRemainder = hundredths
    .map((value, index) => ({ index, remainder: value - floored[index] }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { index } of byRemainder) {
    if (leftover <= 0) break;
    floored[index] += 1;
    leftover -= 1;
  }
  return floored.map((value) => value / 100);
};

export const getMarketValue = (position) =>
  position.quantity * (position.currentPrice ?? position.purchasePrice);

export const getCostOnPurchase = (position) => position.quantity * position.purchasePrice;

export const getUnrealized = (position) => getMarketValue(position) - getCostOnPurchase(position);
