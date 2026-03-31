import express from 'express';
import Database from '../shared/db.js';
import { requireAuth } from '../shared/authMiddleware.js';
import { hashPassword } from '../shared/password.js';
const router = express.Router();
let cachedUsuariosSchema = null;
async function getUsuariosSchema(pool) {
    if (cachedUsuariosSchema)
        return cachedUsuariosSchema;
    const columns = ['telefono', 'avatar_url', 'preferencias'];
    const result = await pool.query(`SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'usuarios'
       AND column_name = ANY($1::text[])`, [columns]);
    const set = new Set(result.rows.map((r) => r.column_name));
    cachedUsuariosSchema = {
        telefono: set.has('telefono'),
        avatar_url: set.has('avatar_url'),
        preferencias: set.has('preferencias'),
    };
    return cachedUsuariosSchema;
}
// GET /api/usuarios/me - Retorna el usuario autenticado (usa el token)
router.get('/me', requireAuth, async (req, res) => {
    const usuarioActual = req.usuarioActual;
    console.log('[Usuarios] GET /me — usuario:', usuarioActual.email);
    try {
        const pool = Database.getInstance().getPool();
        const result = await pool.query(`SELECT id, name, email, role, created_at
       FROM public.usuarios WHERE id = $1`, [usuarioActual.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        console.log('[Usuarios] GET /me — datos retornados para id:', usuarioActual.id);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (err) {
        console.error('[Usuarios] Error en GET /me:', err.message);
        res.status(500).json({ success: false, message: 'Error al obtener usuario', error: err.message });
    }
});
// GET /api/usuarios - Listar todos los usuarios (solo admin)
router.get('/', async (_req, res) => {
    try {
        const pool = Database.getInstance().getPool();
        const result = await pool.query('SELECT id, name, email, role, created_at FROM public.usuarios ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: err.message });
    }
});
// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const pool = Database.getInstance().getPool();
        const result = await pool.query('SELECT id, name, email, role, created_at FROM public.usuarios WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener usuario', error: err.message });
    }
});
// POST /api/usuarios - Crear usuario
router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;
    const errors = [];
    if (!name || name.trim().length < 2)
        errors.push('Nombre: mínimo 2 caracteres');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.push('Email inválido');
    if (!password || password.length < 4)
        errors.push('Contraseña: mínimo 4 caracteres');
    if (!role || !['cliente', 'farmaceutico', 'admin'].includes(role))
        errors.push('Rol inválido');
    if (errors.length > 0)
        return res.status(400).json({ success: false, errors });
    try {
        const pool = Database.getInstance().getPool();
        const em = email.trim().toLowerCase();
        const exists = await pool.query('SELECT id FROM public.usuarios WHERE email = $1', [em]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ success: false, errors: ['El email ya está registrado'] });
        }
        const hashed = await hashPassword(password);
        const result = await pool.query('INSERT INTO public.usuarios (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at', [name.trim(), em, hashed, role]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error al crear usuario', error: err.message });
    }
});
// PUT /api/usuarios/:id - Actualizar usuario
// Nota: la autenticación y autorización la maneja el gateway; el backend confía en él
router.put('/:id', async (req, res) => {
    const { name, email, role, password, telefono, avatar_url, preferencias, } = req.body;
    const errors = [];
    if (name !== undefined && name.trim().length < 2)
        errors.push('Nombre: mínimo 2 caracteres');
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.push('Email inválido');
    if (role !== undefined && !['cliente', 'farmaceutico', 'admin'].includes(role))
        errors.push('Rol inválido');
    if (telefono !== undefined && telefono !== null && String(telefono).length > 20) {
        errors.push('Teléfono: máximo 20 caracteres');
    }
    if (avatar_url !== undefined && avatar_url !== null && String(avatar_url).trim().length > 500) {
        errors.push('URL de foto: máximo 500 caracteres');
    }
    let preferenciasJson = null;
    if (preferencias !== undefined) {
        let pref = preferencias;
        if (typeof preferencias === 'string') {
            try {
                pref = JSON.parse(preferencias);
            }
            catch {
                errors.push('Preferencias: JSON inválido');
            }
        }
        if (pref !== undefined && pref !== null && typeof pref !== 'object') {
            errors.push('Preferencias: debe ser un objeto');
        }
        else if (pref !== undefined && errors.length === 0) {
            preferenciasJson = JSON.stringify(pref === null ? {} : pref);
        }
    }
    if (errors.length > 0)
        return res.status(400).json({ success: false, errors });
    try {
        const pool = Database.getInstance().getPool();
        if (email) {
            const exists = await pool.query('SELECT id FROM public.usuarios WHERE email = $1 AND id != $2', [email, req.params.id]);
            if (exists.rows.length > 0) {
                return res.status(409).json({ success: false, errors: ['El email ya está registrado'] });
            }
        }
        const setClauses = [];
        const values = [];
        let idx = 1;
        if (name !== undefined) {
            setClauses.push(`name = $${idx++}`);
            values.push(name.trim());
        }
        if (email !== undefined) {
            setClauses.push(`email = $${idx++}`);
            values.push(email.trim().toLowerCase());
        }
        if (role !== undefined) {
            setClauses.push(`role = $${idx++}`);
            values.push(role);
        }
        if (password !== undefined && String(password).length >= 4) {
            setClauses.push(`password = $${idx++}`);
            values.push(await hashPassword(String(password)));
        }
        if (setClauses.length === 0)
            return res.status(400).json({ success: false, message: 'Nada que actualizar' });
        values.push(req.params.id);
        const returningCols = ['id', 'name', 'email', 'role', 'created_at'];
        let result;
        try {
            result = await pool.query(`UPDATE public.usuarios SET ${setClauses.join(', ')} WHERE id = $${idx}
         RETURNING ${returningCols.join(', ')}`, values);
        }
        catch (err) {
            const msg = String(err?.message || err);
            if (msg.includes('column') && msg.includes('does not exist')) {
                // Fallback: sólo columnas base.
                const fallbackClauses = [];
                const fallbackValues = [];
                let fIdx = 1;
                if (name !== undefined) {
                    fallbackClauses.push(`name = $${fIdx++}`);
                    fallbackValues.push(name.trim());
                }
                if (email !== undefined) {
                    fallbackClauses.push(`email = $${fIdx++}`);
                    fallbackValues.push(email.trim().toLowerCase());
                }
                if (role !== undefined) {
                    fallbackClauses.push(`role = $${fIdx++}`);
                    fallbackValues.push(role);
                }
                if (password !== undefined && String(password).length >= 4) {
                    fallbackClauses.push(`password = $${fIdx++}`);
                    fallbackValues.push(await hashPassword(String(password)));
                }
                if (fallbackClauses.length === 0)
                    return res.status(400).json({ success: false, message: 'Nada que actualizar' });
                fallbackValues.push(req.params.id);
                const fallbackReturning = ['id', 'name', 'email', 'role', 'created_at'];
                result = await pool.query(`UPDATE public.usuarios SET ${fallbackClauses.join(', ')} WHERE id = $${fIdx}
           RETURNING ${fallbackReturning.join(', ')}`, fallbackValues);
            }
            else {
                throw err;
            }
        }
        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: err.message });
    }
});
// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const pool = Database.getInstance().getPool();
        const result = await pool.query('DELETE FROM public.usuarios WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, message: 'Usuario eliminado' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: err.message });
    }
});
export default router;
//# sourceMappingURL=usuariosRouter.js.map