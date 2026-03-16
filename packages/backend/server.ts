import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from './shared/db.js';
import authRouter from './auth/authRouter.js';
import medicamentosRouter from './medicamentos/medicamentosRouter.js';
import preciosRouter from './precios/preciosRouter.js';
import sugerenciasRouter from './sugerencias/sugerenciasRouter.js';
import farmaciasRouter from './farmacias/farmaciasRouter.js';
import categoriasRouter from './categorias/categoriasRouter.js';
import busquedaRouter from './busqueda/busquedaRouter.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use('/api/auth',         authRouter);
app.use('/api/sugerencias',  sugerenciasRouter);
app.use('/api/medicamentos', medicamentosRouter);
app.use('/api/precios',      preciosRouter);
app.use('/api/farmacias',    farmaciasRouter);
app.use('/api/categorias',   categoriasRouter);
app.use('/api/busqueda',     busquedaRouter);  // ← Búsqueda avanzada + fuzzy

app.get('/api/dashboard', async (_req, res) => {
  try {
    const pool = Database.getInstance().getPool();
    const [farmacias, medicamentos, precios] = await Promise.all([
      pool.query('SELECT * FROM farmacias'),
      pool.query(`
        SELECT m.*, c.nombre as categoria_nombre 
        FROM medicamentos m 
        LEFT JOIN categorias c ON m.categoria_id = c.id
      `),
      pool.query(`
        SELECT p.*, 
               m.name as medicamento_nombre, m.lab as laboratorio,
               f.name as farmacia_nombre, f.address as farmacia_direccion
        FROM precios p
        JOIN medicamentos m ON p.medicamento_id = m.id
        JOIN farmacias f ON p.farmacia_id = f.id
        ORDER BY p.fecha DESC
      `),
    ]);

    const formatFarmacia = (row: any) => ({
      _id: row.id?.toString() || '',
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      lat: row.lat,
      lng: row.lng,
    });

    const formatMedicamento = (row: any) => ({
      _id: row.id?.toString() || '',
      id: row.id,
      name: row.name,
      lab: row.lab,
      active: row.active,
      description: row.description,
      category: row.categoria_nombre,
      categoria_id: row.categoria_id,
      categoria_nombre: row.categoria_nombre,
    });

    const formatPrecio = (row: any) => ({
      _id: row.id?.toString() || '',
      id: row.id,
      precio: row.precio,
      fecha: row.fecha,
      medicamentoId: {
        _id: row.medicamento_id?.toString() || '',
        id: row.medicamento_id,
        name: row.medicamento_nombre,
        lab: row.laboratorio,
      },
      farmaciaId: {
        _id: row.farmacia_id?.toString() || '',
        id: row.farmacia_id,
        name: row.farmacia_nombre,
        address: row.farmacia_direccion,
      },
    });

    res.json({
      farmacias: farmacias.rows.map(formatFarmacia),
      medicamentos: medicamentos.rows.map(formatMedicamento),
      precios: precios.rows.map(formatPrecio),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
