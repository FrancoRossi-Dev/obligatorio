const STOCK_SECURITY_TYPES = [
  'Common Stock',
  'Preferred',
  'Conv Prfd',
  'ADR',
  'GDR',
  'BDR',
  'EDR',
  'CDR',
  'CEDEAR',
  'Canadian DR',
  'Singapore DR',
  'NVDR',
  'HDR',
  'IDR',
  'TDR',
  'Foreign Sh.',
  'NY Reg Shrs',
  'Stapled Security',
  'Tracking Stk',
  'REIT',
  'MLP',
  'Private Comp',
];

const BOND_SECURITY_TYPES = [
  'Bond',
  'Conv Bond',
  'US GOVERNMENT',
  'TREASURY BILL',
  'UK GILT STOCK',
  'Corp',
  'Corporate Bond',
];

const FUND_SECURITY_TYPES = [
  'Mutual Fund',
  'Open-End Fund',
  'Closed-End Fund',
  'Fund of Funds',
  'Pvt Eqty Fund',
  'Managed Account',
  'Unit Inv Tst',
  'UIT',
  'Savings Plan',
  'ETP',
];

const classify = (securityType) => {
  if (STOCK_SECURITY_TYPES.includes(securityType)) return 'stock';
  if (FUND_SECURITY_TYPES.includes(securityType)) return 'fund';
  if (BOND_SECURITY_TYPES.includes(securityType)) return 'bond';

  return null;
};

export const normalizeSecurityType = ({
  securityType,
  securityType2,
}) => {
  // first try to classify by securityType
  // after that, try securityType2
  const type = classify(securityType) ?? classify(securityType2);

  if (type) return type;

  if (['ETF', 'Fund'].includes(securityType2)) return 'fund';

  if (
    ['Preferred Stock', 'Depositary Receipt'].includes(securityType2)
  ) {
    return 'stock';
  }

  if (['Note', 'Bill', 'Govt', 'Muni'].includes(securityType2)) {
    return 'bond';
  }

  return 'other';
};