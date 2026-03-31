import { IMedicamento } from '../../models/Medicamento.js';
import { SugerenciaStrategy, SugerenciaResult } from './SugerenciaStrategy.js';
/**
 * Estrategia 3: Similitud Básica (includes)
 * Busca medicamentos donde el query aparezca en cualquier parte del nombre,
 * laboratorio o descripción. Es la más amplia y se usa como fallback
 * cuando las estrategias anteriores no devuelven resultados.
 */
export declare class SimilitudBasicaStrategy implements SugerenciaStrategy {
    nombre: string;
    buscar(query: string, medicamentos: IMedicamento[]): SugerenciaResult[];
}
//# sourceMappingURL=SimilitudBasicaStrategy.d.ts.map