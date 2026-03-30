import express from 'express';
import Database from '../shared/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requerido' });
  }

  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(
      'SELECT id, name, email, role FROM usuarios WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    // Token: base64(email) — mismo esquema que antes para no romper nada
    const token = Buffer.from(usuario.email).toString('base64');

    console.log(`[Auth] Login exitoso: ${usuario.email} (rol: ${usuario.role})`);

    res.json({
      token,
      user: {
        id:    usuario.id,
        name:  usuario.name,
        email: usuario.email,
        role:  usuario.role,
      },
    });
  } catch (error) {
    console.error('[Auth] Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
