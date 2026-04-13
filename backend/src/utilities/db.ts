import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in environment');

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  await seedAdmin();
}

async function seedAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.warn('[WARN] ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }

  const existing = await User.findOne({ isAdmin: true });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, isAdmin: true });
  console.log(`✅ Admin user created: ${name} <${email}>`);
}
