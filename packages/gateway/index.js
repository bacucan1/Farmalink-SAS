require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ================= AUTH (delegado al backend: bcrypt + JWT) ================= */

app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, req.body);
        const d = response.data;
        if (d.token && d.user) {
            return res.json({ token: d.token, user: d.user });
        }
        res.json(d);
    } catch (err) {
        const status = err.response?.status || 401;
        const data = err.response?.data || { message: 'Error de autenticación' };
        res.status(status).json(data);
    }
});

/** Registro público solo como cliente (sin token admin). */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son obligatorios' });
        }
        const response = await axios.post(`${BACKEND_URL}/api/usuarios`, {
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            password: String(password),
            role: 'cliente',
        });
        res.status(response.status === 201 ? 201 : 200).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { success: false, message: 'Error al registrar' });
    }
});

/* ================= MIDDLEWARE JWT ================= */

function validateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, "supersecreto");
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ message: 'Token inválido' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}

/* ================= PROXIES ================= */

// Medicamentos - CRUD completo
app.get('/api/medicamentos', async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const response = await axios.get(`${BACKEND_URL}/api/medicamentos?${query}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend medicamentos' }); }
});

app.get('/api/medicamentos/:id', validateJWT, async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/medicamentos/${req.params.id}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend medicamentos' }); }
});

app.post('/api/medicamentos', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.post(BACKEND_URL + '/api/medicamentos', req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al crear medicamento' });
    }
});

app.put('/api/medicamentos/:id', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/medicamentos/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al actualizar medicamento' });
    }
});

app.delete('/api/medicamentos/:id', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/medicamentos/${req.params.id}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error al eliminar medicamento' }); }
});

// Farmacias
app.get('/api/farmacias/cercanas', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const response = await axios.get(`${BACKEND_URL}/api/farmacias/cercanas?lat=${lat}&lng=${lng}`);
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching farmacias cercanas from backend:', err.message);
        res.status(500).json({ success: false, error: 'Error en backend farmacias cercanas' });
    }
});

app.get('/api/farmacias', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/farmacias`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend farmacias' }); }
});

// Precios
app.get('/api/precios', validateJWT, async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/precios`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend precios' }); }
});

app.post('/api/precios', validateJWT, async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/precios`, req.body, {
            headers: {
                'x-user-email': req.user?.email || 'sistema'
            }
        });
        res.status(response?.status || 201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al procesar precio' });
    }
});

// Comparar precios: GET /api/precios/comparar/:medicamentoId?orden=asc|desc|reciente
app.get('/api/precios/comparar/:medicamentoId', validateJWT, async (req, res) => {
    try {
        const { medicamentoId } = req.params;
        const orden = req.query.orden || 'asc';
        const response = await axios.get(`${BACKEND_URL}/api/precios/comparar/${medicamentoId}?orden=${orden}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error en comparación de precios' });
    }
});

// Actualizar precio
app.put('/api/precios/:id', validateJWT, async (req, res) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/precios/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al actualizar precio' });
    }
});

// Categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/categorias`);
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching categorias:', err.message);
        res.status(500).json({ error: 'Error en backend categorias' });
    }
});


// Dashboard - Agrega datos consolidados
app.get('/api/dashboard', validateJWT, async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/dashboard`);
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching dashboard:', err.message);
        res.status(500).json({ error: 'Error en backend dashboard' });
    }
});

// Home público - datos mínimos sin autenticación
app.get('/api/home', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/home`);
        res.json(response.data);
    } catch {
        res.json({ success: true, farmCount: 0, categorias: [] });
    }
});

// Sugerencias (búsqueda de medicamentos)
app.get('/api/sugerencias', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || String(q).trim().length < 2) {
            return res.json({ success: true, sugerencias: [], estrategiaUsada: '' });
        }
        const query = new URLSearchParams({ q: String(q) }).toString();
        // Try the dedicated sugerencias endpoint first (returns already formatted data)
        try {
            const sugResponse = await axios.get(`${BACKEND_URL}/api/sugerencias?${query}`);
            if (sugResponse.data && sugResponse.data.success) {
                return res.json(sugResponse.data);
            }
        } catch (_e) { /* fallback below */ }
        const response = await axios.get(`${BACKEND_URL}/api/medicamentos?${query}`);
        const medicamentos = response.data?.data || response.data || [];
        const sugerencias = medicamentos.slice(0, 10).map((m) => ({
            _id: m._id || m.id,
            name: m.name || m.nombre || '',
            lab: m.lab || m.laboratorio || '',
            category: m.category || m.categoria || m.categoria_nombre || '',
            description: m.description || m.descripcion || '',
            estrategiaUsada: 'coincidencia_parcial'
        }));
        res.json({ success: true, sugerencias, estrategiaUsada: 'coincidencia_parcial' });
    } catch {
        res.json({ success: true, sugerencias: [], estrategiaUsada: '' });
    }
});

/* ================= USUARIOS ================= */

// GET /api/usuarios/me — cualquier usuario autenticado puede ver su propio perfil
// IMPORTANTE: debe ir ANTES de /:id para que Express no lo capture como id="me"
app.get('/api/usuarios/me', validateJWT, async (req, res) => {
    console.log('[Gateway] GET /api/usuarios/me — email:', req.user.email);
    try {
        const response = await axios.get(`${BACKEND_URL}/api/usuarios/me`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (err) {
        console.error('[Gateway] Error en GET /me:', err.message);
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al obtener perfil' });
    }
});

app.get('/api/usuarios', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/usuarios`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Error en backend usuarios' });
    }
});

app.get('/api/usuarios/:id', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/usuarios/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al obtener usuario' });
    }
});

app.post('/api/usuarios', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/usuarios`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al crear usuario' });
    }
});

// PUT /api/usuarios/:id — el propio usuario puede editarse; admin puede editar a cualquiera
app.put('/api/usuarios/:id', validateJWT, async (req, res) => {
    const idObjetivo = parseInt(req.params.id);
    console.log(`[Gateway] PUT /api/usuarios/${idObjetivo} — solicitante: ${req.user.email} (rol: ${req.user.role})`);

    if (req.user.role !== 'admin') {
        try {
            const lista = await axios.get(`${BACKEND_URL}/api/usuarios`);
            const yo = (lista.data?.data || []).find(u => u.email === req.user.email);
            if (!yo || Number(yo.id) !== Number(idObjetivo)) {
                console.warn(`[Gateway] PUT denegado: ${req.user.email} intentó editar id:${idObjetivo}`);
                return res.status(403).json({ success: false, message: 'No tienes permiso para editar este usuario' });
            }
        } catch {
            return res.status(500).json({ error: 'Error al verificar identidad' });
        }
    }

    try {
        const response = await axios.put(`${BACKEND_URL}/api/usuarios/${req.params.id}`, req.body);
        console.log(`[Gateway] PUT /api/usuarios/${idObjetivo} — OK`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al actualizar usuario' });
    }
});

app.delete('/api/usuarios/:id', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/usuarios/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al eliminar usuario' });
    }
});

// Búsqueda avanzada con fuzzy search y filtros
app.get('/api/busqueda', async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const response = await axios.get(`${BACKEND_URL}/api/busqueda?${query}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Error en backend búsqueda' });
    }
});

app.get('/api/busqueda/filtros', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/busqueda/filtros`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Error en backend filtros' });
    }
});



// Historial de precios: GET /api/precios/historial/:medicamentoId
app.get('/api/precios/historial/:medicamentoId', validateJWT, async (req, res) => {
    try {
        const { medicamentoId } = req.params;
        const response = await axios.get(`${BACKEND_URL}/api/precios/historial/${medicamentoId}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al obtener historial de precios' });
    }
});

/* ================= SERVER ================= */

app.listen(PORT, () => {
    console.log(`Gateway corriendo en http://localhost:${PORT}`);
});
