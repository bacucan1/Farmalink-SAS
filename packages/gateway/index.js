require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

/* ================= LOGIN ================= */

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requerido' });
    if (!password) return res.status(400).json({ message: 'Contraseña requerida' });

    let role = 'cliente';
    if (email === 'admin@farmalink.com' && password === 'admin123') {
        role = 'admin';
    } else if (email === 'farmaceutico@farmalink.com' && password === 'farm123') {
        role = 'farmaceutico';
    }

    const token = jwt.sign({ email, password, role }, "supersecreto", { expiresIn: '1h' });
    res.json({ token, user: { email, role } });
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
        const response = await axios.get(`http://localhost:3001/api/medicamentos?${query}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend medicamentos' }); }
});

app.get('/api/medicamentos/:id', validateJWT, async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/medicamentos/${req.params.id}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend medicamentos' }); }
});

app.post('/api/medicamentos', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/api/medicamentos', req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al crear medicamento' });
    }
});

app.put('/api/medicamentos/:id', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.put(`http://localhost:3001/api/medicamentos/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al actualizar medicamento' });
    }
});

app.delete('/api/medicamentos/:id', validateJWT, requireAdmin, async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:3001/api/medicamentos/${req.params.id}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error al eliminar medicamento' }); }
});

// Farmacias
app.get('/api/farmacias/cercanas', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const response = await axios.get(`http://localhost:3001/api/farmacias/cercanas?lat=${lat}&lng=${lng}`);
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching farmacias cercanas from backend:', err.message);
        res.status(500).json({ success: false, error: 'Error en backend farmacias cercanas' });
    }
});

app.get('/api/farmacias', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/farmacias');
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend farmacias' }); }
});

// Precios
app.get('/api/precios', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/precios');
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend precios' }); }
});

// Comparar precios: GET /api/precios/comparar/:medicamentoId?orden=asc|desc|reciente
app.get('/api/precios/comparar/:medicamentoId', validateJWT, async (req, res) => {
    try {
        const { medicamentoId } = req.params;
        const orden = req.query.orden || 'asc';
        const response = await axios.get(`http://localhost:3001/api/precios/comparar/${medicamentoId}?orden=${orden}`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error en comparación de precios' });
    }
});

// Actualizar precio
app.put('/api/precios/:id', validateJWT, async (req, res) => {
    try {
        const response = await axios.put(`http://localhost:3001/api/precios/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al actualizar precio' });
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
        const response = await axios.get(`http://localhost:3001/api/medicamentos?${query}`);
        const medicamentos = response.data || [];
        const sugerencias = medicamentos.slice(0, 10).map((m) => ({
            _id: m._id,
            name: m.nombre,
            lab: m.laboratorio || '',
            category: m.categoria || '',
            description: m.descripcion || '',
            estrategiaUsada: 'coincidencia_parcial'
        }));
        res.json({ success: true, sugerencias, estrategiaUsada: 'coincidencia_parcial' });
    } catch {
        res.json({ success: true, sugerencias: [], estrategiaUsada: '' });
    }
});

/* ================= SERVER ================= */

app.listen(PORT, () => {
    console.log(`Gateway corriendo en http://localhost:${PORT}`);
});
