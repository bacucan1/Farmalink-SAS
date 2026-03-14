import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from './shared/db.js';
import authRouter from './auth/authRouter.js';
import medicamentosRouter from './medicamentos/medicamentosRouter.js';
import preciosRouter from './precios/preciosRouter.js';
import sugerenciasRouter from './sugerencias/sugerenciasRouter.js';
import farmaciasRouter from './farmacias/farmaciasRouter.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

const db = Database.getInstance();

db.connect()
  .then(() => {
    console.log('✅ PostgreSQL conectado exitosamente');
  })
  .catch(err => {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  });

app.use('/api/auth', authRouter);
app.use('/api/sugerencias', sugerenciasRouter);
app.use('/api/medicamentos', medicamentosRouter);
app.use('/api/precios', preciosRouter);
app.use('/api/farmacias', farmaciasRouter);

app.get('/api/dashboard', async (_req, res) => {
  try {
    const pool = Database.getInstance().getPool();
    const [farmacias, medicamentos, precios] = await Promise.all([
      pool.query('SELECT * FROM farmacias'),
      pool.query('SELECT * FROM medicamentos'),
      pool.query('SELECT * FROM precios'),
    ]);
    res.json({ 
      farmacias: farmacias.rows, 
      medicamentos: medicamentos.rows, 
      precios: precios.rows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
