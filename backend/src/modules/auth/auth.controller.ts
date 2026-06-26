import { Request, Response } from 'express';
import { User, hashPassword } from '../../models/User';
import { Role } from '../../types';
import { ApiError } from '../../utils/ApiError';
import { AUTH_COOKIE, cookieOptions, signToken } from '../../utils/jwt';
import { LoginInput, SignupInput } from './auth.schemas';

/** Public signup always creates a BORROWER. Executive accounts come from the seed script. */
export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as SignupInput;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: Role.BORROWER });

  const token = signToken(user.id, user.role);
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = signToken(user.id, user.role);
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  user.passwordHash = '';
  res.json({ user });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw ApiError.unauthorized();
  }
  res.json({ user });
}
