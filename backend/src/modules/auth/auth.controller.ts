import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { env } from "../../config/env";
import { query } from "../../config/database";
import { CreateUserInput, User, UserRole } from "../../models/User";
import { createJwtToken } from "../../utils/jwt";
import { AuthenticatedRequest, AuthTokenPayload } from "./auth.types";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

const mapUser = (row: UserRow): User => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString()
});

export const getAuthOverview = (_req: Request, res: Response): void => {
  res.json({
    module: "auth",
    message: "Modulo de autenticacion con JWT listo para proteger el acceso en la app.",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET /api/portal/resumen",
      "GET /api/portal/guardian",
      "GET /api/portal/especialista",
      "GET /api/portal/admin"
    ]
  });
};

export const register = async (
  req: Request<unknown, unknown, CreateUserInput>,
  res: Response
): Promise<void> => {
  const { fullName, email, password, role = "guardian" } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({
      message: "fullName, email y password son obligatorios."
    });
    return;
  }

  const existingUser = await query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (existingUser.rowCount) {
    res.status(409).json({ message: "Ya existe un usuario con ese email." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query<UserRow>(
    `INSERT INTO users (id, full_name, email, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [uuidv4(), fullName, email.toLowerCase(), passwordHash, role]
  );

  res.status(201).json({
    message: "Usuario base creado correctamente.",
    user: mapUser(result.rows[0])
  });
};

export const login = async (
  req: Request<unknown, unknown, { email: string; password: string }>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "email y password son obligatorios." });
    return;
  }

  const result = await query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (!result.rowCount) {
    res.status(401).json({ message: "Credenciales invalidas." });
    return;
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    res.status(401).json({ message: "Credenciales invalidas." });
    return;
  }

  const tokenPayload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  };

  const token = createJwtToken(tokenPayload, env.jwtAccessSecret, 60 * 60 * 2);

  res.json({
    message: "Inicio de sesion exitoso.",
    token,
    expiresIn: "2h",
    user: mapUser(user)
  });
};

export const getAuthenticatedUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.authUser?.sub;

  if (!userId) {
    res.status(401).json({
      message: "No se pudo identificar al usuario autenticado."
    });
    return;
  }

  const result = await query<UserRow>("SELECT * FROM users WHERE id = $1", [userId]);

  if (!result.rowCount) {
    res.status(404).json({
      message: "Usuario no encontrado."
    });
    return;
  }

  res.json({
    message: "Usuario autenticado obtenido correctamente.",
    user: mapUser(result.rows[0])
  });
};
