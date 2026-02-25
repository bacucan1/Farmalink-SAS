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

    if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
    }

    const token = jwt.sign(
        { email },
        "supersecreto",
        { expiresIn: '1h' }
    );

    res.json({ token });
});

/* ================= MIDDLEWARE JWT ================= */

function validateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, "supersecreto");
        next();
    } catch {
        return res.status(403).json({ message: 'Token inválido' });
    }
}

/* ================= PROXIES ================= */

// Medicamentos
app.get('/api/medicamentos', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/medicamentos');
        res.json(response.data);
    } catch {
        res.status(500).json({ error: 'Error en backend medicamentos' });
    }
});

// Farmacias
app.get('/api/farmacias', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/farmacias');
        res.json(response.data);
    } catch {
        res.status(500).json({ error: 'Error en backend farmacias' });
    }
});

// Precios
app.get('/api/precios', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/precios');
        res.json(response.data);
    } catch {
        res.status(500).json({ error: 'Error en backend precios' });
    }
});

// Dashboard
app.get('/api/dashboard', validateJWT, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/api/dashboard');
        res.json(response.data);
    } catch {
        res.status(500).json({ error: 'Error en backend dashboard' });
    }
});

/* ================= SERVER ================= */

app.listen(PORT, () => {
    console.log(`Gateway corriendo en http://localhost:${PORT}`);
});