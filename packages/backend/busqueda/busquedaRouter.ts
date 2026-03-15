import { Router, Request, Response } from 'express';
import Database from '../shared/db.js';

const router = Router();

/**
 * GET /api/busqueda
 *
 * Búsqueda avanzada de medicamentos con:
 *  - Fuzzy Search via pg_trgm (tolerancia a errores ortográficos)
 *  - Filtros combinables: categoría, laboratorio, rango de precios, disponibilidad
 *  - Ordenamiento: relevancia | precio_asc | precio_desc | nombre
 *  - Paginación: page, limit
 *
 * Query params:
 *  q           - Texto de búsqueda fuzzy (opcional)
 *  categoria   - Nombre de categoría (parcial, case-insensitive)
 *  precioMin   - Precio mínimo en COP
 *  precioMax   - Precio máximo en COP
 *  disponible  - "true" = tiene precios registrados | "false" = sin precios
 *  lab         - Laboratorio (parcial, case-insensitive)
 *  orden       - relevancia | precio_asc | precio_desc | nombre  (default: relevancia)
 *  page        - Página (default: 1)
 *  limit       - Resultados por página (default: 10, max: 50)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = Database.getInstance().getPool();

    // Activar pg_trgm (idempotente)
    await pool.query('CREATE EXTENSION IF NOT EXISTS pg_trgm').catch(() => {});

    // ── Leer parámetros ────────────────────────────────────────────────────
    const q         = ((req.query.q         as string) || '').trim();
    const categoria = ((req.query.categoria as string) || '').trim();
    const lab       = ((req.query.lab       as string) || '').trim();
    const orden     = ((req.query.orden     as string) || 'relevancia').toLowerCase();
    const disponible = req.query.disponible as string | undefined;
    const precioMin  = req.query.precioMin ? parseInt(req.query.precioMin as string) : null;
    const precioMax  = req.query.precioMax ? parseInt(req.query.precioMax as string) : null;
    const page       = Math.max(1, parseInt((req.query.page  as string) || '1'));
    const limit      = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '10')));
    const offset     = (page - 1) * limit;

    const params: any[] = [];
    let   pi = 1; // índice de parámetro

    // ── Score de similitud fuzzy ───────────────────────────────────────────
    let scoreExpr = '1.0';
    if (q) {
      scoreExpr = `GREATEST(
        word_similarity($${pi}, m.name),
        word_similarity($${pi}, m.lab),
        word_similarity($${pi}, COALESCE(m.description, ''))
      )`;
      params.push(q);
      pi++;
    }

    // Subquery: precio mínimo por medicamento
    const precioSub = `(SELECT MIN(p2.precio) FROM precios p2 WHERE p2.medicamento_id = m.id)`;

    // ── SELECT base ────────────────────────────────────────────────────────
    let sql = `
      SELECT
        m.id,
        m.name,
        m.lab,
        m.active,
        m.description,
        m.categoria_id,
        c.nombre                    AS categoria_nombre,
        ${scoreExpr}                AS score,
        ${precioSub}                AS precio_minimo,
        COUNT(DISTINCT pr.farmacia_id) AS farmacias_count
      FROM medicamentos m
      LEFT JOIN categorias c ON m.categoria_id = c.id
      LEFT JOIN precios pr   ON pr.medicamento_id = m.id
      WHERE m.active = true
    `;

    // ── Filtro fuzzy ───────────────────────────────────────────────────────
    if (q) {
      sql += ` AND (
        word_similarity($1, m.name)                         > 0.1
        OR word_similarity($1, m.lab)                       > 0.1
        OR word_similarity($1, COALESCE(m.description,''))  > 0.1
        OR m.name ILIKE $${pi}
        OR m.lab  ILIKE $${pi}
      )`;
      params.push(`%${q}%`);
      pi++;
    }

    // ── Filtro por categoría ───────────────────────────────────────────────
    if (categoria) {
      sql += ` AND c.nombre ILIKE $${pi}`;
      params.push(`%${categoria}%`);
      pi++;
    }

    // ── Filtro por laboratorio ─────────────────────────────────────────────
    if (lab) {
      sql += ` AND m.lab ILIKE $${pi}`;
      params.push(`%${lab}%`);
      pi++;
    }

    // ── Filtro por disponibilidad ──────────────────────────────────────────
    if (disponible === 'true') {
      sql += ` AND EXISTS (SELECT 1 FROM precios p3 WHERE p3.medicamento_id = m.id)`;
    } else if (disponible === 'false') {
      sql += ` AND NOT EXISTS (SELECT 1 FROM precios p3 WHERE p3.medicamento_id = m.id)`;
    }

    // ── Filtro por rango de precios ────────────────────────────────────────
    if (precioMin !== null && !isNaN(precioMin)) {
      sql += ` AND ${precioSub} >= $${pi}`;
      params.push(precioMin);
      pi++;
    }
    if (precioMax !== null && !isNaN(precioMax)) {
      sql += ` AND ${precioSub} <= $${pi}`;
      params.push(precioMax);
      pi++;
    }

    sql += ` GROUP BY m.id, m.name, m.lab, m.active, m.description, m.categoria_id, c.nombre`;

    // ── Ordenamiento ───────────────────────────────────────────────────────
    switch (orden) {
      case 'precio_asc':
        sql += ` ORDER BY precio_minimo ASC NULLS LAST`;
        break;
      case 'precio_desc':
        sql += ` ORDER BY precio_minimo DESC NULLS LAST`;
        break;
      case 'nombre':
        sql += ` ORDER BY m.name ASC`;
        break;
      default: // relevancia
        sql += q ? ` ORDER BY score DESC, m.name ASC` : ` ORDER BY m.name ASC`;
    }

    // ── Conteo total para paginación ───────────────────────────────────────
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${sql}) AS sub`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // ── Paginación ─────────────────────────────────────────────────────────
    sql += ` LIMIT $${pi} OFFSET $${pi + 1}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);

    res.json({
      success: true,
      query: q || null,
      filtros: {
        categoria:   categoria   || null,
        lab:         lab         || null,
        precioMin:   precioMin   ?? null,
        precioMax:   precioMax   ?? null,
        disponible:  disponible  ?? null,
        orden,
      },
      paginacion: {
        page,
        limit,
        total,
        totalPaginas: Math.ceil(total / limit),
      },
      data: result.rows.map((row: any) => ({
        id:               row.id,
        name:             row.name,
        lab:              row.lab,
        description:      row.description,
        categoria_id:     row.categoria_id,
        categoria_nombre: row.categoria_nombre || null,
        precio_minimo:    row.precio_minimo ? parseInt(row.precio_minimo) : null,
        farmacias_count:  parseInt(row.farmacias_count),
        score:            row.score ? parseFloat(parseFloat(row.score).toFixed(3)) : null,
      })),
    });

  } catch (error: any) {
    console.error('[Búsqueda] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda avanzada',
      error: error.message,
    });
  }
});

/**
 * GET /api/busqueda/filtros
 *
 * Devuelve los valores disponibles para poblar los controles del frontend:
 * categorías con conteo, laboratorios y rango de precios actual en BD.
 */
router.get('/filtros', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pool = Database.getInstance().getPool();

    const [categorias, laboratorios, precioRango] = await Promise.all([
      pool.query(`
        SELECT c.id, c.nombre, c.orden, COUNT(m.id) AS total_medicamentos
        FROM categorias c
        LEFT JOIN medicamentos m ON m.categoria_id = c.id AND m.active = true
        GROUP BY c.id, c.nombre, c.orden
        ORDER BY c.orden ASC, c.nombre ASC
      `),
      pool.query(`
        SELECT DISTINCT lab, COUNT(*) AS total
        FROM medicamentos
        WHERE active = true
        GROUP BY lab
        ORDER BY lab ASC
      `),
      pool.query(`
        SELECT
          MIN(precio)          AS precio_min,
          MAX(precio)          AS precio_max,
          ROUND(AVG(precio))   AS precio_promedio
        FROM precios
      `),
    ]);

    res.json({
      success: true,
      filtros: {
        categorias:   categorias.rows,
        laboratorios: laboratorios.rows,
        precioRango: {
          min:      parseInt(precioRango.rows[0]?.precio_min)      || 0,
          max:      parseInt(precioRango.rows[0]?.precio_max)      || 0,
          promedio: parseInt(precioRango.rows[0]?.precio_promedio) || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('[Búsqueda/filtros] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener filtros',
      error: error.message,
    });
  }
});

export default router;
