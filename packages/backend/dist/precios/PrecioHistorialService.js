import Database from '../shared/db.js';
export class PrecioHistorialService {
    static async registrarCambio(input) {
        const pool = Database.getInstance().getPool();
        try {
            await pool.query(`INSERT INTO historial_precios 
          (precio_id, medicamento_id, farmacia_id, precio_anterior, precio_nuevo, quien_cambio, fecha_cambio)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [
                input.precio_id,
                input.medicamento_id,
                input.farmacia_id,
                input.precio_anterior,
                input.precio_nuevo,
                input.quien_cambio || null
            ]);
            console.log('[Historial] Cambio registrado:', input);
        }
        catch (error) {
            console.error('[Historial] Error al registrar cambio:', error);
            throw error;
        }
    }
    static async obtenerHistorialPorMedicamento(medicamentoId) {
        const pool = Database.getInstance().getPool();
        const result = await pool.query(`SELECT h.*, f.name as farmacia_nombre 
       FROM historial_precios h
       JOIN farmacias f ON f.id = h.farmacia_id
       WHERE h.medicamento_id = $1
       ORDER BY h.fecha_cambio DESC`, [medicamentoId]);
        return result.rows;
    }
    static async obtenerHistorialPorPrecio(precioId) {
        const pool = Database.getInstance().getPool();
        const result = await pool.query(`SELECT * FROM historial_precios WHERE precio_id = $1 ORDER BY fecha_cambio DESC`, [precioId]);
        return result.rows;
    }
}
//# sourceMappingURL=PrecioHistorialService.js.map