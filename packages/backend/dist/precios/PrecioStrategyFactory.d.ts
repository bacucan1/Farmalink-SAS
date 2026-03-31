import { PrecioStrategy } from './strategies/PrecioStrategy.js';
/**
 * Factory Method para estrategias de ordenamiento de precios.
 *
 * Selección automática:
 *  - 'asc'      → PrecioAscendenteStrategy  (más barato primero) — DEFAULT
 *  - 'desc'     → PrecioDescendenteStrategy (más caro primero)
 *  - 'reciente' → PrecioRecienteStrategy    (más reciente primero)
 */
export declare class PrecioStrategyFactory {
    private static readonly strategies;
    /**
     * Crea la estrategia de ordenamiento según el parámetro recibido.
     * Si no se especifica o es inválido, usa ascendente por defecto.
     */
    static create(orden?: string): PrecioStrategy;
}
//# sourceMappingURL=PrecioStrategyFactory.d.ts.map