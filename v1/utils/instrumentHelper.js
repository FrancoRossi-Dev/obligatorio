export const normalizeSecurityType = (type) => {
  const equity = [
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

  const bond = [
    'Bond',
    'Conv Bond',
    'US GOVERNMENT',
    'TREASURY BILL',
    'UK GILT STOCK',
    'Corp',
    'Corporate Bond',
  ];

  const found = [
    'Mutual Fund',
    'Open-End Fund',
    'Closed-End Fund',
    'Fund of Funds',
    'Pvt Eqty Fund',
    'Managed Account',
    'Unit Inv Tst',
    'UIT',
    'Savings Plan',
  ];

  switch (type) {
    case equity.contains(type):
      return 'equity';
    case bond.contains(type):
      return 'bond';
    case found.contains(type):
      return 'found';
  }
};
