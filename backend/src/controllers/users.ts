import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

// POST /api/v1/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).json({ error: 'name and password are required' });
    return;
  }

  const user = await User.findOne({ name });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: user._id.toString(), isAdmin: user.isAdmin },
    getSecret(),
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
  });
}

// GET /api/v1/users
export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find({}, { password: 0 }).sort({ name: 1 });
  res.json({ users });
}

// POST /api/v1/users
export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email, and password are required' });
    return;
  }

  const existing = await User.findOne({ $or: [{ name }, { email }] });
  if (existing) {
    res.status(409).json({ error: 'A user with that name or email already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
}

// DELETE /api/v1/users/:id
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.isAdmin) {
    res.status(403).json({ error: 'The admin user cannot be deleted' });
    return;
  }
  await user.deleteOne();
  res.json({ ok: true });
}
