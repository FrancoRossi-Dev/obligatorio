// Usage: node scripts/seed-data.js
// Seeds a demo advisor, banks, issuers, instruments, clients and positions
// so the API has realistic data to develop and demo reports against.
// Idempotent: deletes any previously seeded demo data before recreating it.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../v1/config/db.config.js';
import Bank from '../v1/models/bank.model.js';
import Client from '../v1/models/client.model.js';
import Instrument from '../v1/models/instrument.model.js';
import Issuer from '../v1/models/issuer.model.js';
import Manager from '../v1/models/manager.model.js';
import Position from '../v1/models/Position.model.js';
import User, { Advisor } from '../v1/models/user.model.js';
import { readFile } from 'node:fs/promises';


const SEED_ADVISOR_USERNAME = 'demo.advisor';
const rawPositions = JSON.parse(
  await readFile(
    new URL('./seed-positions-data.json', import.meta.url),
    'utf8',
  ),
);//lee el archivo seed-positions-data.json y lo convierte en un objeto de JavaScript
const SEED_BANK_NAMES = [...new Set(rawPositions.map((position) => position.bank)),];
const SEED_ISSUER_LEGAL_NAMES =  [
  'Apple Inc.',
  'Microsoft Corporation',
  'Alphabet Inc.',
  'Amazon.com, Inc.',
  'NVIDIA Corporation',
  'Tesla, Inc.',
  'Berkshire Hathaway Inc.',
];
const SEED_INSTRUMENT_ISIN = [ ...new Set(rawPositions.map((position) => position.isin)),];

await connectDB();

const previousAdvisor = await User.findOne({ username: SEED_ADVISOR_USERNAME });
if (previousAdvisor) {
  const previousClients = await Client.find({ advisorId: previousAdvisor.id });
  await Position.deleteMany({ clientId: { $in: previousClients.map((client) => client.id) } });
  await Client.deleteMany({ advisorId: previousAdvisor.id });
  await Manager.deleteMany({ advisorId: previousAdvisor.id });
  await User.deleteOne({ _id: previousAdvisor.id });
  console.log('Removed previously seeded demo data.');
}
await Bank.deleteMany({ name: { $in: SEED_BANK_NAMES } });
await Issuer.deleteMany({ legalName: { $in: SEED_ISSUER_LEGAL_NAMES } });
await Instrument.deleteMany({ isin: { $in: SEED_INSTRUMENT_ISIN } });

const hashedPassword = await bcrypt.hash('Demo1234!', Number(process.env.SALT_ROUNDS));
const advisor = await Advisor.create({
  username: SEED_ADVISOR_USERNAME,
  password: hashedPassword,
  details: {
    comercialName: 'Rossi Wealth Advisors',
    legalName: 'Rossi Wealth Advisors LLC',
    address: '1200 Brickell Ave, Miami, FL',
    country: 'USA',
    document: 'US-EIN-88-1234567',
    phone: '+1-305-555-0100',
    contactEmail: 'contact@rossiwealth.com',
  },
  planTier: 'premium',
});
console.log(`Created advisor "${advisor.username}".`);

const banks = await Bank.create(
  SEED_BANK_NAMES.map((name) => ({
    name,
    region: 'International',
    country: 'Unknown',
    logoURL: `https://picsum.photos/seed/${encodeURIComponent(name)}/200`,
  })),
);
console.log(`Created ${banks.length} banks.`);
const bankByName = new Map(
  banks.map((bank) => [
    bank.name,
    bank,
  ]),
);

const issuers = await Issuer.create([
   {
    commercialName: 'Apple',
    legalName: 'Apple Inc.',
    country: 'USA',
  },
  {
    commercialName: 'Microsoft',
    legalName: 'Microsoft Corporation',
    country: 'USA',
  },
  {
    commercialName: 'Alphabet',
    legalName: 'Alphabet Inc.',
    country: 'USA',
  },
  {
    commercialName: 'Amazon',
    legalName: 'Amazon.com, Inc.',
    country: 'USA',
  },
  {
    commercialName: 'NVIDIA',
    legalName: 'NVIDIA Corporation',
    country: 'USA',
  },
  {
    commercialName: 'Tesla',
    legalName: 'Tesla, Inc.',
    country: 'USA',
  },
  {
    commercialName: 'Berkshire Hathaway',
    legalName: 'Berkshire Hathaway Inc.',
    country: 'USA',
  },
]);
console.log(`Created ${issuers.length} issuers.`);

const issuerByName = new Map(
  issuers.map((issuer) => [
    issuer.legalName,
    issuer,
  ]),
);


const instruments = await Instrument.create([
  {
    isin: 'US0378331005',
    type: 'stock',
    name: 'Apple Inc.',
    issuerId: issuerByName.get('Apple Inc.').id,
  },
  {
    isin: 'US5949181045',
    type: 'stock',
    name: 'Microsoft Corp.',
    issuerId: issuerByName.get('Microsoft Corporation').id,
  },
  {
    isin: 'US02079K3059',
    type: 'stock',
    name: 'Alphabet Inc.',
    issuerId: issuerByName.get('Alphabet Inc.').id,
  },
  {
    isin: 'US0231351067',
    type: 'stock',
    name: 'Amazon.com Inc.',
    issuerId: issuerByName.get('Amazon.com, Inc.').id,
  },
  {
    isin: 'US67066G1040',
    type: 'stock',
    name: 'NVIDIA Corp.',
    issuerId: issuerByName.get('NVIDIA Corporation').id,
  },
  {
    isin: 'US78462F1030',
    type: 'fund',
    name: 'SPDR S&P 500 ETF Trust',
    fundDetail: {
      composition: 'equity',
    },
  },
  {
    isin: 'US4642872265',
    type: 'fund',
    name: 'iShares Core U.S. Aggregate Bond ETF',
    fundDetail: {
      composition: 'bond',
    },
  },
  {
    isin: 'US4642872000',
    type: 'fund',
    name: 'iShares Core S&P 500 ETF',
    fundDetail: {
      composition: 'equity',
    },
  },
  {
    isin: 'US88160R1014',
    type: 'stock',
    name: 'Tesla Inc.',
    issuerId: issuerByName.get('Tesla, Inc.').id,
  },
  {
    isin: 'US0846707026',
    type: 'stock',
    name: 'Berkshire Hathaway Inc. Class B',
    issuerId: issuerByName.get('Berkshire Hathaway Inc.').id,
  },
]);
console.log(`Created ${instruments.length} instruments.`);

const instrumentByIsin = new Map(
  instruments.map((instrument) => [
    instrument.isin,
    instrument,
  ]),
);

const manager = await Manager.create({
  fullName: 'John Doe',
  email: 'john.doe@doeholdings.com',
  advisorId: advisor.id,
});
console.log(`Created manager "${manager.fullName}".`);

//lo lee del precarga
const clientNames = [
  ...new Set(
    rawPositions.map((position) => position.nameAccount),
  ),
];

const clients = [];

for (const clientName of clientNames) {
  const clientId = new mongoose.Types.ObjectId();

  const clientRows = rawPositions.filter(
    (position) => position.nameAccount === clientName,
  );

  const uniqueAccounts = [
    ...new Map(
      clientRows.map((position) => [
        `${position.bank}-${position.numberAccount}`,
        {
          bank: position.bank,
          number: position.numberAccount,
          currency: position.currency,
        },
      ]),
    ).values(),
  ];

  const client = await Client.create({
    _id: clientId,

    advisorId: advisor.id,

    clientDetails: {
      commercialName: clientName,
      legalName: clientName,
      country: 'Uruguay',
    },

    managerId: manager.id,

    bankAccounts: uniqueAccounts.map((account) => ({
      clientId,

      bankId: bankByName.get(account.bank).id,

      number: account.number,

      accountName: `${clientName} - ${account.bank}`,

      currency: account.currency,
    })),
  });

  clients.push(client);
}

console.log(`Created ${clients.length} clients.`);

const clientByName = new Map(
  clients.map((client) => [
    client.clientDetails.commercialName,
    client,
  ]),
);

const positions = rawPositions.map((row) => {
  const client = clientByName.get(row.nameAccount);

  const bank = bankByName.get(row.bank);

  const instrument = instrumentByIsin.get(row.isin);

  if (!client) {
    throw new Error(`Client not found: ${row.nameAccount}`);
  }

  if (!bank) {
    throw new Error(`Bank not found: ${row.bank}`);
  }

  if (!instrument) {
    throw new Error(`Instrument not found: ${row.isin}`);
  }

  const bankAccount = client.bankAccounts.find(
    (account) =>
      account.bankId.toString() === bank.id.toString() &&
      account.number === row.numberAccount,
  );

  if (!bankAccount) {
    throw new Error(
      `Bank account not found: ${row.nameAccount} - ${row.bank}`,
    );
  }

  return {
    clientId: client.id,

    bankAccountId: bankAccount.id,

    ...(instrument.issuerId
      ? {
          issuerId: instrument.issuerId,
        }
      : {}),

    instrumentId: instrument.id,

    quantity: row.quantity,

    purchasePrice: row.costPrice,

    currentPrice: row.marketPrice,

    currency: row.currency,

    dateOfPurchase: new Date(row.dateOfPurchase),
  };
});

await Position.insertMany(positions);

console.log(`Created ${positions.length} positions.`);

await mongoose.disconnect();
console.log('Seed complete.');
