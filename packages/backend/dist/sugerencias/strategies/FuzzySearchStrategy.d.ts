import { IMedicamento } from '../../models/Medicamento.js';
import { SugerenciaStrategy, SugerenciaResult } from './SugerenciaStrategy.js';
/**
 * Estrategia 4: Fuzzy Search con pg_trgm
 *
 * Usa la extensión pg_trgm de PostgreSQL para búsqueda tolerante a
 * errores ortográficos mediante similitud de trigramas.
 *
 * Ejemplos de corrección automática:
 *   "aspirnia"     → "Aspirina"
 *   "acetaminofen" → "Acetaminofén"
 *   "ibuprofem"    → "Ibuprofeno"
 *   "amoxicilna"   → "Amoxicilina"
 */
export declare class FuzzySearchStrategy implements SugerenciaStrategy {
    nombre: string;
    buscar(query: string, medicamentos: IMedicamento[]): Promise<SugerenciaResult[]>;
    /**
     * Fallback: Levenshtein normalizado en JavaScript.
     * Se activa solo si pg_trgm no está disponible en la BD.
     */
    private _fallbackJS;
    private _levenshteinScore;
}
//# sourceMappingURL=FuzzySearchStrategy.d.ts.map