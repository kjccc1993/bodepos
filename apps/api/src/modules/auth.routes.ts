import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { asyncHandler } from '../shared/async-handler.js';
import { AppError } from '../shared/errors.js';
import { prisma } from '../shared/prisma.js';
import { authRequired, signSession, verifySession } from '../shared/session.js';
import { normalizeUsername, usernameSchema } from '../shared/username.js';

export const authRouter = Router();

const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1),
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Credenciales inválidas');
    }
    const username = normalizeUsername(parsed.data.username);
    const user = await prisma.user.findFirst({
      where: { username, isActive: true },
      include: { store: true },
    });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }
    const token = signSession({
      user_id: user.id,
      store_id: user.storeId,
      username: user.username,
      role: user.role,
    });
    res.json({ token });
  }),
);

authRouter.get(
  '/validate-token',
  asyncHandler(async (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token no proporcionado');
    }
    const session = verifySession(header.slice(7));
    res.json(session);
  }),
);

authRouter.get(
  '/me',
  authRequired,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.session!.user_id } });
    if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Usuario no encontrado');
    res.json({ username: user.username, role: user.role, storeId: user.storeId });
  }),
);
