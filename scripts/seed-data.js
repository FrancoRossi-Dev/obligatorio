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
import Issuer from '../v1/models/issuer.model.js';
import Manager from '../v1/models/manager.model.js';
import Position from '../v1/models/position.model.js';
import User, { Advisor } from '../v1/models/user.model.js';
import { readFile } from 'node:fs/promises';
import {resolveInstrumentsByIsinService,} from '../v1/services/instruments.services.js';


const SEED_ADVISOR_USERNAME = 'demo.advisor';
const rawPositions = JSON.parse(
  await readFile(
    new URL('./seed-positions-data.json', import.meta.url),
    'utf8',
  ),
);//lee el archivo seed-positions-data.json y lo convierte en un objeto de JavaScript
const SEED_BANK_NAMES = [...new Set(rawPositions.map((position) => position.bank)),];
const SEED_INSTRUMENT_ISIN = [ ...new Set(rawPositions.map((position) => position.isin.trim().toUpperCase())),];

await connectDB();

const issuerDefinitions  = [
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
];

const issuers = [];

for (const issuerData of issuerDefinitions) {
  const issuer = await Issuer.findOneAndUpdate(
    { legalName: issuerData.legalName },
    { $setOnInsert: issuerData },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    },
  );

  issuers.push(issuer);
}
console.log(`Created ${issuers.length} issuers.`);

const issuerByName = new Map(
  issuers.map((issuer) => [
    issuer.legalName,
    issuer,
  ]),
);

const seedIssuerNamesByIsin = new Map([
  ['US0378331005', 'Apple Inc.'],
  ['US5949181045', 'Microsoft Corporation'],
  ['US02079K3059', 'Alphabet Inc.'],
  ['US0231351067', 'Amazon.com, Inc.'],
  ['US67066G1040', 'NVIDIA Corporation'],
  ['US88160R1014', 'Tesla, Inc.'],
  ['US0846707026', 'Berkshire Hathaway Inc.'],
]);

const issuerIdsByIsin = new Map(
  [...seedIssuerNamesByIsin].map(([isin, name]) => [
    isin,
    issuerByName.get(name)._id,
  ]),
);

const {
  instruments: instrumentByIsin,
  failures,
} = await resolveInstrumentsByIsinService(
  SEED_INSTRUMENT_ISIN,
  issuerIdsByIsin,
);

if (failures.size > 0) {
  await mongoose.disconnect();

  throw new Error(
    `Seed instruments could not be resolved: ${JSON.stringify(
      [...failures],
    )}`,
  );
}

console.log(
  `Resolved ${instrumentByIsin.size} instruments from MongoDB / OpenFIGI.`,
);

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

const hashedPassword = await bcrypt.hash('Demo1234!', Number(process.env.SALT_ROUNDS));
const advisor = await Advisor.create({
  username: SEED_ADVISOR_USERNAME,
  password: hashedPassword,
  details: {
    comercialName: 'Straw Hat Wealth Advisors',
    legalName: 'Straw Hat Crew Wealth Advisors LLC',
    address: '1200 Brickell Ave, Miami, FL',
    country: 'USA',
    document: 'US-EIN-88-1234567',
    phone: '+1-305-555-0100',
    contactEmail: 'contact@strawhatcrew.com',
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


const managers = await Manager.create([
  { fullName: 'Monkey D. Luffy', email: 'monkey.d.luffy@strawhatcrew.com', advisorId: advisor.id },
  { fullName: 'Nico Robin', email: 'nico.robin@strawhatcrew.com', advisorId: advisor.id },
  { fullName: 'Roronoa Zoro', email: 'roronoa.zoro@strawhatcrew.com', advisorId: advisor.id },
]);
console.log(`Created ${managers.length} managers.`);

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

    // Round-robin, so every run gives each manager the same clients
    managerId: managers[clients.length % managers.length].id,

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

  const instrument = instrumentByIsin.get(row.isin.trim().toUpperCase());

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
    
    marketValue: row.marketValue,

    currency: row.currency,

    dateOfPurchase: new Date(row.dateOfPurchase),
  };
});

await Position.insertMany(positions);

console.log(`Created ${positions.length} positions.`);

await mongoose.disconnect();
console.log('Seed complete.');
