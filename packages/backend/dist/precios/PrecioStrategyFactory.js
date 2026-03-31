import { PrecioAscendenteStrategy } from './strategies/PrecioAscendenteStrategy.js';
import { PrecioDescendenteStrategy } from './strategies/PrecioDescendenteStrategy.js';
import { PrecioRecienteStrategy } from './strategies/PrecioRecienteStrategy.js';
/**
 * Factory Method para estrategias de ordenamiento de precios.
 *
 * Selección automática:
 *  - 'asc'      → PrecioAscendenteStrategy  (más barato primero) — DEFAULT
 *  - 'desc'     → PrecioDescendenteStrategy (más caro primero)
 *  - 'reciente' → PrecioRecienteStrategy    (más reciente primero)
 */
export class PrecioStrategyFactory {
    /**
     * Crea la estrategia de ordenamiento según el parámetro recibido.
     * Si no se especifica o es inválido, usa ascendente por defecto.
     */
    static create(orden) {
        if (orden && orden in PrecioStrategyFactory.strategies) {
            return PrecioStrategyFactory.strategies[orden];
        }
        // Default: precio ascendente (más barato primero)
        return PrecioStrategyFactory.strategies.asc;
    }
}
PrecioStrategyFactory.strategies = {
    asc: new PrecioAscendenteStrategy(),
    desc: new PrecioDescendenteStrategy(),
    reciente: new PrecioRecienteStrategy(),
};
//# sourceMappingURL=PrecioStrategyFactory.js.map