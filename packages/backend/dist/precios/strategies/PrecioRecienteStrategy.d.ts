import { PrecioStrategy, PrecioItem } from './PrecioStrategy.js';
/**
 * Estrategia: Precio Reciente
 * Ordena por la fecha de actualización más reciente primero.
 * Útil para ver qué farmacias tienen precios actualizados recientemente.
 */
export declare class PrecioRecienteStrategy implements PrecioStrategy {
    nombre: string;
    ordenar(precios: PrecioItem[]): PrecioItem[];
}
//# sourceMappingURL=PrecioRecienteStrategy.d.ts.map