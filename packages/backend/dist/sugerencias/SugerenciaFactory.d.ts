import { SugerenciaStrategy } from './strategies/SugerenciaStrategy.js';
/**
 * Factory Method para estrategias de sugerencias.
 *
 * Lógica de selección automática según el query:
 *  1. Si el query contiene términos de categorías → PorCategoriaStrategy
 *  2. Si el query tiene 4+ caracteres             → FuzzySearchStrategy (pg_trgm)
 *  3. Si el query tiene 3 caracteres              → CoincidenciaParcialStrategy
 *  4. Fallback                                    → SimilitudBasicaStrategy
 *
 * También permite selección manual mediante el parámetro `tipo`.
 */
export declare class SugerenciaFactory {
    private static readonly strategies;
    private static readonly categoryKeywords;
    static create(query: string, tipo?: string): SugerenciaStrategy;
    static createAll(): SugerenciaStrategy[];
}
//# sourceMappingURL=SugerenciaFactory.d.ts.map