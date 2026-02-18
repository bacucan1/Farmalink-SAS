import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Farmacia } from './models/Farmacia.js';
import { Medicamento } from './models/Medicamento.js';
import { Precio } from './models/Precio.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmalink';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

app.get('/api/farmacias', async (_req, res) => {
  try {
    const farmacias = await Farmacia.find();
    res.json(farmacias);
  } catch {
    res.status(500).json({ error: 'Error fetching farmacias' });
  }
});

app.get('/api/medicamentos', async (_req, res) => {
  try {
    const medicamentos = await Medicamento.find().populate('farmaciaId');
    res.json(medicamentos);
  } catch {
    res.status(500).json({ error: 'Error fetching medicamentos' });
  }
});

app.get('/api/precios', async (_req, res) => {
  try {
    const precios = await Precio.find()
      .populate('medicamentoId')
      .populate('farmaciaId');
    res.json(precios);
  } catch {
    res.status(500).json({ error: 'Error fetching precios' });
  }
});

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
