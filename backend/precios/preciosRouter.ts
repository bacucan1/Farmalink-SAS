import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Precio } from '../models/Precio.js';
import { Medicamento } from '../models/Medicamento.js';
import { PrecioStrategyFactory } from './PrecioStrategyFactory.js';
import { PrecioItem } from './strategies/PrecioStrategy.js';
import { validateUpdatePrecio } from './PrecioDTO.js';

const router = Router();

// ── GET /api/precios ──────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const precios = await Precio.find()
      .populate('medicamentoId', 'name lab category')
      .populate('farmaciaId', 'name address');
    res.json({ success: true, total: precios.length, data: precios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener precios', error });
  }
});

// ── GET /api/precios/comparar/:medicamentoId ──────────────────────────────────
// Devuelve: { medicamento, mejorPrecio, listaOrdenada }
// Query param: ?orden=asc|desc|reciente (default: asc)
router.get('/comparar/:medicamentoId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { medicamentoId: medId } = req.params;
    const medicamentoId = Array.isArray(medId) ? medId[0] : medId;
    const orden = req.query.orden as string | undefined;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(medicamentoId)) {
      res.status(400).json({ success: false, message: 'medicamentoId inválido' });
      return;
    }

    // Buscar el medicamento
    const medicamento = await Medicamento.findById(medicamentoId).lean();
    if (!medicamento) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }

    // Buscar todos los precios de ese medicamento
    const preciosRaw = await Precio.find({ medicamentoId })
      .populate('farmaciaId', 'name address phone')
      .lean();

    if (preciosRaw.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No hay precios registrados para este medicamento',
      });
      return;
    }

    // Mapear al formato PrecioItem
    const precioItems: PrecioItem[] = preciosRaw.map((p: any) => ({
      precioId: p._id.toString(),
      farmaciaId: p.farmaciaId,
      farmaciaNombre: (p.farmaciaId as any)?.name ?? 'Desconocida',
      precio: p.precio,
      fecha: p.fecha,
    }));

    // Aplicar Strategy mediante Factory
    const strategy = PrecioStrategyFactory.create(orden);
    const listaOrdenada = strategy.ordenar(precioItems);

    // El mejor precio es siempre el primero de la lista ascendente
    const mejorPrecioItem = PrecioStrategyFactory.create('asc').ordenar(precioItems)[0];

    res.json({
      success: true,
      estrategiaUsada: strategy.nombre,
      medicamento: {
        _id: (medicamento._id as any).toString(),
        name: medicamento.name,
        lab: medicamento.lab,
        category: medicamento.category,
        description: medicamento.description,
      },
      mejorPrecio: {
        precio: mejorPrecioItem.precio,
        farmaciaNombre: mejorPrecioItem.farmaciaNombre,
        farmaciaId: mejorPrecioItem.farmaciaId,
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

// ── PUT /api/precios/:id ──────────────────────────────────────────────────────
// Simula actualización de precio. Solo permite cambiar el campo `precio`.
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: paramId } = req.params;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    // Validar DTO
    const errors = validateUpdatePrecio(req.body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, message: 'Datos inválidos', errors });
      return;
    }

    const actualizado = await Precio.findByIdAndUpdate(
      id,
      {
        $set: {
          precio: req.body.precio,
          fecha: new Date(), // Actualizar fecha al momento del cambio
        },
      },
      { new: true }
    )
      .populate('medicamentoId', 'name lab')
      .populate('farmaciaId', 'name');

    if (!actualizado) {
      res.status(404).json({ success: false, message: 'Precio no encontrado' });
      return;
    }

    res.json({
      success: true,
      message: 'Precio actualizado correctamente',
      data: actualizado,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar precio', error });
  }
});

export default router;
