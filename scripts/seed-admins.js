// Usage: ADMIN_SEED_PASSWORD=<password> node scripts/seed-admins.js <username> [<username> ...]
// Admins can't self-register (RF11), so they are preloaded here. Existing usernames are skipped.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../v1/config/db.config.js';
import User, { Admin } from '../v1/models/user.model.js';

const usernames = process.argv.slice(2);
const password = process.env.ADMIN_SEED_PASSWORD;

if (!usernames.length || !password) {
  console.error('Provide at least one username and set ADMIN_SEED_PASSWORD.');
  process.exit(1);
}

await connectDB();

const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

for (const username of usernames) {
  if (await User.exists({ username })) {
    console.log(`Skipped "${username}": username already exists.`);
    continue;
  }
  await Admin.create({ username, password: hashedPassword });
  console.log(`Created admin "${username}".`);
}

await mongoose.disconnect();
