import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './auth/authRouter.js';
import { Farmacia } from './models/Farmacia.js';
import { Medicamento } from './models/Medicamento.js';
import { Precio } from './models/Precio.js';
import sugerenciasRouter from './sugerencias/sugerenciasRouter.js';
import medicamentosRouter from './medicamentos/medicamentosRouter.js';
import preciosRouter from './precios/preciosRouter.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmalink';

console.log('🔌 Intentando conectar a MongoDB:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB conectado exitosamente');
    console.log('📊 Estado de conexión:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    console.error('📊 Estado de conexión:', mongoose.connection.readyState);
  });

// ── Auth ───────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ── Sugerencias: Strategy + Factory ─────────────────────────────────────────
app.use('/api/sugerencias', sugerenciasRouter);

// ── Medicamentos: CRUD limpio con DTO y validaciones ────────────────────────
app.use('/api/medicamentos', medicamentosRouter);

// ── Precios: Strategy + Factory + comparación + PUT ─────────────────────────
app.use('/api/precios', preciosRouter);

// ── Farmacias ────────────────────────────────────────────────────────────────
app.get('/api/farmacias', async (_req, res) => {
  try {
    const farmacias = await Farmacia.find();
    res.json(farmacias);
  } catch {
    res.status(500).json({ error: 'Error fetching farmacias' });
  }
});

// ── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard', async (_req, res) => {
  try {
    const [farmacias, medicamentos, precios] = await Promise.all([
      Farmacia.find(),
      Medicamento.find().populate('farmaciaId'),
      Precio.find().populate('medicamentoId').populate('farmaciaId')
    ]);
    res.json({ farmacias, medicamentos, precios });
  } catch {
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
