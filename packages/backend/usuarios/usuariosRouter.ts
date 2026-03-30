import express from 'express';
import Database from '../shared/db.js';

const router = express.Router();

// =====================================================
// RUTAS DE PERFIL (usuario autenticado)
// El Gateway inyecta el usuario validado en req.user
// =====================================================

// GET /api/usuarios/perfil - Obtener perfil del usuario autenticado
// El Gateway pasa el usuario decodificado como cabecera x-user-email o x-user-data
router.get('/perfil', async (req, res) => {
  // El gateway inyecta el payload JWT como cabecera
  const userEmail = req.headers['x-user-email'] as string;
  if (!userEmail) {
    return res.status(401).json({ success: false, message: 'No autenticado. Se requiere token.' });
  }
  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(
      `SELECT id, name, email, role, phone, address, bio, birth_date, 
              profile_picture, preferences, last_login, created_at, updated_at
       FROM usuarios WHERE email = $1`,
      [userEmail]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    // Actualizar last_login en background (no bloquear respuesta)
    pool.query('UPDATE usuarios SET last_login = NOW() WHERE email = $1', [userEmail]).catch(() => { });
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil', error: err.message });
  }
});

// PUT /api/usuarios/perfil - Actualizar perfil del usuario autenticado
// SEGURIDAD: Solo permite modificar campos de perfil personal.
// Campos sensibles (id, role, email, password) son ignorados aunque se envíen.
router.put('/perfil', async (req, res) => {
  const userEmail = req.headers['x-user-email'] as string;
  if (!userEmail) {
    return res.status(401).json({ success: false, message: 'No autenticado. Se requiere token.' });
  }

  // Whitelist estricta de campos permitidos (principio de menor privilegio)
  const ALLOWED_FIELDS: Record<string, string> = {
    name: 'name',
    phone: 'phone',
    address: 'address',
    bio: 'bio',
    birth_date: 'birth_date',
    profile_picture: 'profile_picture',
    preferences: 'preferences',
  };

  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [field, column] of Object.entries(ALLOWED_FIELDS)) {
    if (req.body[field] !== undefined) {
      // Validaciones específicas
      if (field === 'name' && String(req.body[field]).trim().length < 2) {
        return res.status(400).json({ success: false, message: 'El nombre debe tener al menos 2 caracteres' });
      }
      if (field === 'preferences' && typeof req.body[field] !== 'object') {
        return res.status(400).json({ success: false, message: 'Las preferencias deben ser un objeto JSON' });
      }
      const value = field === 'preferences' ? JSON.stringify(req.body[field]) : req.body[field];
      setClauses.push(`${column} = $${idx++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ success: false, message: 'Ningún campo válido para actualizar' });
  }

  // Agregar updated_at automáticamente
  setClauses.push(`updated_at = NOW()`);
  values.push(userEmail);

  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(
      `UPDATE usuarios 
       SET ${setClauses.join(', ')} 
       WHERE email = $${idx}
       RETURNING id, name, email, role, phone, address, bio, birth_date, 
                 profile_picture, preferences, last_login, created_at, updated_at`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: err.message });
  }
});

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
