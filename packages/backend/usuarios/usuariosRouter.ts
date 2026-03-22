import express from 'express';
import Database from '../shared/db.js';

const router = express.Router();

// GET /api/usuarios - Listar todos los usuarios (solo admin)
router.get('/', async (_req, res) => {
  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: err.message });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario', error: err.message });
  }
});

// POST /api/usuarios - Crear usuario
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;
  const errors: string[] = [];
  if (!name || name.trim().length < 2) errors.push('Nombre: mínimo 2 caracteres');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
  if (!password || password.length < 4) errors.push('Contraseña: mínimo 4 caracteres');
  if (!role || !['cliente', 'farmaceutico', 'admin'].includes(role)) errors.push('Rol inválido');
  if (errors.length > 0) return res.status(400).json({ success: false, errors });

  try {
    const pool = Database.getInstance().getPool();
    // Check email duplicate
    const exists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ success: false, errors: ['El email ya está registrado'] });
    }
    const result = await pool.query(
      'INSERT INTO usuarios (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name.trim(), email.trim().toLowerCase(), password, role]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: err.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  const { name, email, role, password } = req.body;
  const errors: string[] = [];
  if (name !== undefined && name.trim().length < 2) errors.push('Nombre: mínimo 2 caracteres');
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
  if (role !== undefined && !['cliente', 'farmaceutico', 'admin'].includes(role)) errors.push('Rol inválido');
  if (errors.length > 0) return res.status(400).json({ success: false, errors });

  try {
    const pool = Database.getInstance().getPool();
    // Check email duplicate (excluding self)
    if (email) {
      const exists = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, req.params.id]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ success: false, errors: ['El email ya está registrado'] });
      }
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(name.trim()); }
    if (email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(email.trim().toLowerCase()); }
    if (role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(role); }
    if (password !== undefined && password.length >= 4) { setClauses.push(`password = $${idx++}`); values.push(password); }

    if (setClauses.length === 0) return res.status(400).json({ success: false, message: 'Nada que actualizar' });

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE usuarios SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, created_at`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: err.message });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: err.message });
  }
});

export default router;
