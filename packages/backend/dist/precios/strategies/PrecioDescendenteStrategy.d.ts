import { PrecioStrategy, PrecioItem } from './PrecioStrategy.js';
/**
 * Estrategia: Precio Descendente
 * Ordena de mayor a menor precio.
 * Útil para ver las opciones premium primero.
 */
export declare class PrecioDescendenteStrategy implements PrecioStrategy {
    nombre: string;
    ordenar(precios: PrecioItem[]): PrecioItem[];
}
//# sourceMappingURL=PrecioDescendenteStrategy.d.ts.map