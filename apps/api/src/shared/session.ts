import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errors.js';

export type SessionPayload = {
  user_id: string;
  store_id: string;
  email: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      session?: SessionPayload;
    }
  }
}

function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET missing or too short');
  return s;
}

export function signSession(payload: SessionPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'];
  return jwt.sign(payload, jwtSecret(), { expiresIn });
}

export function verifySession(token: string): SessionPayload {
  const decoded = jwt.verify(token, jwtSecret()) as SessionPayload;
  return decoded;
}

export function authOptional(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.session = verifySession(header.slice(7));
    } catch {
      /* ignore */
    }
  }
  next();
}

export function authRequired(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHORIZED', 'Token no proporcionado'));
    return;
  }
  try {
    req.session = verifySession(header.slice(7));
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Token inválido o expirado'));
  }
}

export function requireStore(req: Request): { storeId: string; userId: string } {
  if (!req.session) throw new AppError(401, 'UNAUTHORIZED', 'Sin sesión');
  return { storeId: req.session.store_id, userId: req.session.user_id };
}
