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
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requerido' });
    const token = jwt.sign({ email }, "supersecreto", { expiresIn: '1h' });
    res.json({ token });
});

/* ================= MIDDLEWARE JWT ================= */

function validateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, "supersecreto");
        next();
    } catch {
        return res.status(403).json({ message: 'Token inválido' });
    }
}

/* ================= PROXIES ================= */

// Medicamentos - CRUD completo
app.get('/api/medicamentos', validateJWT, async (req, res) => {
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

app.post('/api/medicamentos', validateJWT, async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/api/medicamentos', req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al crear medicamento' });
    }
});

app.put('/api/medicamentos/:id', validateJWT, async (req, res) => {
    try {
        const response = await axios.put(`http://localhost:3001/api/medicamentos/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Error al actualizar medicamento' });
    }
});

app.delete('/api/medicamentos/:id', validateJWT, async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:3001/api/medicamentos/${req.params.id}`);
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error al eliminar medicamento' }); }
});

// Farmacias
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

// Dashboard
app.get('/api/dashboard', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/dashboard');
        res.json(response.data);
    } catch { res.status(500).json({ error: 'Error en backend dashboard' }); }
});

/* ================= SERVER ================= */

app.listen(PORT, () => {
    console.log(`Gateway corriendo en http://localhost:${PORT}`);
});
