import { PrecioStrategy, PrecioItem } from './PrecioStrategy.js';
/**
 * Estrategia: Precio Ascendente
 * Ordena de menor a mayor precio — muestra primero la opción más económica.
 * Es la estrategia por defecto para comparación de precios.
 */
export declare class PrecioAscendenteStrategy implements PrecioStrategy {
    nombre: string;
    ordenar(precios: PrecioItem[]): PrecioItem[];
}
//# sourceMappingURL=PrecioAscendenteStrategy.d.ts.map