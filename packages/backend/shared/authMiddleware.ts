import { Request, Response, NextFunction } from 'express';
import Database from './db.js';

/**
 * Middleware de autenticación básico.
 * El token es base64(email) — mismo esquema del authRouter.
 * Verifica que el usuario exista en la BD y adjunta req.usuarioActual.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.slice(7);

  let email: string;
  try {
    email = Buffer.from(token, 'base64').toString('utf8');
    if (!email || !email.includes('@')) throw new Error('Token inválido');
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' });
    return;
  }

  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(
      'SELECT id, name, email, role FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    (req as any).usuarioActual = result.rows[0];
    console.log(`[Auth] Petición autorizada: ${email}`);
    next();
  } catch (error) {
    console.error('[Auth] Error verificando token:', error);
    res.status(500).json({ success: false, message: 'Error interno al verificar autenticación' });
  }
}

/**
 * Middleware que además exige rol de admin.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    const usuario = (req as any).usuarioActual;
    if (usuario?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Se requiere rol de administrador' });
      return;
    }
    next();
  });
}
