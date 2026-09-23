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
import Position from '../v1/models/Position.model.js';
import User, { Advisor } from '../v1/models/user.model.js';

const SEED_ADVISOR_USERNAME = 'demo.advisor';
const SEED_BANK_NAMES = ['Banco Santander', 'JPMorgan Chase'];
const SEED_ISSUER_LEGAL_NAMES = ['Apple Inc.', 'United States Department of the Treasury'];
const SEED_INSTRUMENT_NAMES = [
  'Apple Inc. Common Stock',
  'US Treasury Bond 10Y',
  'Global Balanced Fund',
  'USD Cash',
];

await connectDB();

const previousAdvisor = await User.findOne({ username: SEED_ADVISOR_USERNAME });
if (previousAdvisor) {
  const previousClients = await Client.find({ advisorId: previousAdvisor.id });
  await Position.deleteMany({ clientId: { $in: previousClients.map((client) => client.id) } });
  await Client.deleteMany({ advisorId: previousAdvisor.id });
  await User.deleteOne({ _id: previousAdvisor.id });
  console.log('Removed previously seeded demo data.');
}
await Bank.deleteMany({ name: { $in: SEED_BANK_NAMES } });
await Issuer.deleteMany({ legalName: { $in: SEED_ISSUER_LEGAL_NAMES } });
await Instrument.deleteMany({ name: { $in: SEED_INSTRUMENT_NAMES } });

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

const banks = await Bank.create([
  {
    name: 'Banco Santander',
    region: 'South America',
    country: 'Uruguay',
    logoURL: 'https://picsum.photos/seed/santander/200',
  },
  {
    name: 'JPMorgan Chase',
    region: 'North America',
    country: 'USA',
    logoURL: 'https://picsum.photos/seed/jpmorgan/200',
  },
]);
console.log(`Created ${banks.length} banks.`);

const issuers = await Issuer.create([
  { commercialName: 'Apple', legalName: 'Apple Inc.', country: 'USA' },
  { commercialName: 'US Treasury', legalName: 'United States Department of the Treasury', country: 'USA' },
]);
console.log(`Created ${issuers.length} issuers.`);

const [apple, usTreasury] = issuers;

const instruments = await Instrument.create([
  { type: 'stock', name: 'Apple Inc. Common Stock', issuerId: apple.id },
  { type: 'bond', name: 'US Treasury Bond 10Y', issuerId: usTreasury.id },
  { type: 'fund', name: 'Global Balanced Fund', fundDetail: { composition: 'balanced' } },
  { type: 'cash', name: 'USD Cash' },
]);
console.log(`Created ${instruments.length} instruments.`);

const [appleStock, treasuryBond, balancedFund, usdCash] = instruments;

const clientId = new mongoose.Types.ObjectId();
const client = await Client.create({
  _id: clientId,
  advisorId: advisor.id,
  clientDetails: {
    commercialName: 'Doe Holdings',
    legalName: 'John Doe Holdings SRL',
    address: 'Av. 18 de Julio 1234, Montevideo',
    country: 'Uruguay',
  },
  manager: {
    fullName: 'John Doe',
    email: 'john.doe@doeholdings.com',
  },
  bankAccounts: [
    {
      clientId,
      bankId: banks[0].id,
      number: 'UY-0001-2345',
      accountName: 'Doe Holdings USD',
      currency: 'USD',
    },
    {
      clientId,
      bankId: banks[1].id,
      number: 'US-9988-7766',
      accountName: 'Doe Holdings Chase USD',
      currency: 'USD',
    },
  ],
});
console.log(`Created client "${client.clientDetails.commercialName}" with ${client.bankAccounts.length} bank accounts.`);

const [santanderAccount, chaseAccount] = client.bankAccounts;

const positions = await Position.create([
  {
    clientId: client.id,
    bankAccountId: santanderAccount.id,
    issuerId: apple.id,
    instrumentId: appleStock.id,
    quantity: 50,
    purchasePrice: 150,
    currentPrice: 190,
    currency: 'USD',
    dateOfPurchase: new Date('2024-03-15'),
  },
  {
    clientId: client.id,
    bankAccountId: santanderAccount.id,
    issuerId: usTreasury.id,
    instrumentId: treasuryBond.id,
    quantity: 20,
    purchasePrice: 980,
    currentPrice: 1005,
    currency: 'USD',
    dateOfPurchase: new Date('2023-11-01'),
  },
  {
    clientId: client.id,
    bankAccountId: chaseAccount.id,
    instrumentId: balancedFund.id,
    quantity: 100,
    purchasePrice: 25,
    currentPrice: 27.5,
    currency: 'USD',
    dateOfPurchase: new Date('2024-06-10'),
  },
  {
    clientId: client.id,
    bankAccountId: chaseAccount.id,
    instrumentId: usdCash.id,
    quantity: 10000,
    purchasePrice: 1,
    currentPrice: 1,
    currency: 'USD',
    dateOfPurchase: new Date('2024-01-02'),
  },
]);
console.log(`Created ${positions.length} positions.`);

await mongoose.disconnect();
console.log('Seed complete.');
