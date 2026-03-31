import { IMedicamento } from '../../models/Medicamento.js';
import { SugerenciaStrategy, SugerenciaResult } from './SugerenciaStrategy.js';
/**
 * Estrategia 1: Coincidencia Parcial
 * Busca medicamentos cuyo nombre comience con el query (startsWith, case-insensitive).
 * Es la más precisa y se activa por defecto cuando el usuario escribe el inicio del nombre.
 */
export declare class CoincidenciaParcialStrategy implements SugerenciaStrategy {
    nombre: string;
    buscar(query: string, medicamentos: IMedicamento[]): SugerenciaResult[];
}
//# sourceMappingURL=CoincidenciaParcialStrategy.d.ts.map