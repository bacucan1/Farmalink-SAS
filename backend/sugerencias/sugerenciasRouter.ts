import { Router, Request, Response } from 'express';
import { Medicamento } from '../models/Medicamento.js';
import { SugerenciaFactory } from './SugerenciaFactory.js';
import { SugerenciaResult } from './strategies/SugerenciaStrategy.js';

const router = Router();

/**
 * GET /api/sugerencias?q=<query>&estrategia=<parcial|categoria|similitud>&limit=<n>
 *
 * Parámetros:
 *  - q          (requerido) texto de búsqueda, mínimo 2 caracteres
 *  - estrategia (opcional) fuerza una estrategia específica
 *  - limit      (opcional) máximo de resultados, default 8
 *
 * Flujo:
 *  1. Valida que q tenga al menos 2 caracteres
 *  2. Carga todos los medicamentos activos desde Mongo
 *  3. La Factory selecciona la estrategia adecuada
 *  4. Si la estrategia principal devuelve 0 resultados → usa SimilitudBasica como fallback
 *  5. Elimina duplicados y limita la respuesta
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string || '').trim();
    const estrategiaTipo = req.query.estrategia as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 8, 20);

    // Validación mínima: al menos 2 caracteres
    if (q.length < 2) {
      res.status(400).json({
        success: false,
        message: 'El parámetro "q" debe tener al menos 2 caracteres',
        sugerencias: [],
      });
      return;
    }

    // Cargar medicamentos activos desde MongoDB
    const medicamentos = await Medicamento.find({ active: true }).lean();

    // Seleccionar estrategia mediante Factory
    const estrategia = SugerenciaFactory.create(q, estrategiaTipo);
    let resultados: SugerenciaResult[] = estrategia.buscar(q, medicamentos as any);

    // Fallback: si la estrategia principal no da resultados, usar similitud básica
    if (resultados.length === 0 && estrategia.nombre !== 'similitud_basica') {
      const fallback = SugerenciaFactory.create(q, 'similitud');
      resultados = fallback.buscar(q, medicamentos as any);
    }

    // Eliminar duplicados por _id y aplicar límite
    const vistos = new Set<string>();
    const unicos = resultados.filter((r) => {
      if (vistos.has(r._id)) return false;
      vistos.add(r._id);
      return true;
    }).slice(0, limit);

    res.json({
      success: true,
      query: q,
      estrategiaUsada: unicos[0]?.estrategiaUsada ?? estrategia.nombre,
      total: unicos.length,
      sugerencias: unicos,
    });
  } catch (error) {
    console.error('[Sugerencias] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al buscar sugerencias',
      sugerencias: [],
    });
  }
});

export default router;
