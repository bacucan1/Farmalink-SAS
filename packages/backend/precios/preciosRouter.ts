import { Router, Request, Response } from 'express';
import Database from '../shared/db.js';
import { PrecioStrategyFactory } from './PrecioStrategyFactory.js';
import { PrecioItem } from './strategies/PrecioStrategy.js';
import { validateUpdatePrecio } from './PrecioDTO.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pool = Database.getInstance().getPool();
    const result = await pool.query(`
      SELECT p.*, m.name as medicamento_nombre, m.lab as laboratorio, 
             m.description as medicamento_descripcion,
             f.name as farmacia_nombre, f.address as farmacia_direccion, f.phone as farmacia_telefono
      FROM precios p
      JOIN medicamentos m ON p.medicamento_id = m.id
      JOIN farmacias f ON p.farmacia_id = f.id
      ORDER BY p.fecha DESC
    `);
    res.json({ success: true, total: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener precios', error });
  }
});

router.get('/comparar/:medicamentoId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { medicamentoId: medId } = req.params;
    const orden = req.query.orden as string | undefined;

    const pool = Database.getInstance().getPool();

    const medResult = await pool.query('SELECT * FROM medicamentos WHERE id = $1', [medId]);
    if (medResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }
    const medicamento = medResult.rows[0];

    const preciosResult = await pool.query(`
      SELECT p.*, f.name as farmacia_nombre, f.address as farmacia_direccion
      FROM precios p
      JOIN farmacias f ON p.farmacia_id = f.id
      WHERE p.medicamento_id = $1
      ORDER BY p.fecha DESC
    `, [medId]);

    if (preciosResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No hay precios registrados para este medicamento',
      });
      return;
    }

    const precioItems: PrecioItem[] = preciosResult.rows.map((p: any) => ({
      precioId: p.id.toString(),
      farmaciaId: { _id: p.farmacia_id.toString(), name: p.farmacia_nombre, address: p.farmacia_direccion },
      farmaciaNombre: p.farmacia_nombre,
      precio: p.precio,
      fecha: p.fecha,
    }));

    const strategy = PrecioStrategyFactory.create(orden);
    const listaOrdenada = strategy.ordenar(precioItems);

    const mejorPrecioItem = PrecioStrategyFactory.create('asc').ordenar(precioItems)[0];

    res.json({
      success: true,
      estrategiaUsada: strategy.nombre,
      medicamento: {
        id: medicamento.id.toString(),
        name: medicamento.name,
        lab: medicamento.lab,
        description: medicamento.description,
      },
      mejorPrecio: {
        precio: mejorPrecioItem.precio,
        farmaciaNombre: mejorPrecioItem.farmaciaNombre,
        fecha: mejorPrecioItem.fecha,
      },
      listaOrdenada: listaOrdenada.map((item) => ({
        ...item,
        estrategiaUsada: strategy.nombre,
      })),
    });
  } catch (error) {
    console.error('[Precios] Error en comparar:', error);
    res.status(500).json({ success: false, message: 'Error al comparar precios', error });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: paramId } = req.params;
    const idString = Array.isArray(paramId) ? paramId[0] : paramId;
    const id = parseInt(idString);

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    const errors = validateUpdatePrecio(req.body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, message: 'Datos inválidos', errors });
      return;
    }

    const pool = Database.getInstance().getPool();
    
    const result = await pool.query(
      `UPDATE precios SET precio = $1, fecha = NOW() WHERE id = $2 RETURNING *`,
      [req.body.precio, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Precio no encontrado' });
      return;
    }

    res.json({
      success: true,
      message: 'Precio actualizado correctamente',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar precio', error });
  }
});

export default router;
