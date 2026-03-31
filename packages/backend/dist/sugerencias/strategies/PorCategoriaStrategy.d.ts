import { IMedicamento } from '../../models/Medicamento.js';
import { SugerenciaStrategy, SugerenciaResult } from './SugerenciaStrategy.js';
export declare class PorCategoriaStrategy implements SugerenciaStrategy {
    nombre: string;
    private readonly categoriasConocidas;
    buscar(query: string, medicamentos: IMedicamento[]): Promise<SugerenciaResult[]>;
}
//# sourceMappingURL=PorCategoriaStrategy.d.ts.map