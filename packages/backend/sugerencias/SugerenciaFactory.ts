import { SugerenciaStrategy } from './strategies/SugerenciaStrategy.js';
import { CoincidenciaParcialStrategy } from './strategies/CoincidenciaParcialStrategy.js';
import { PorCategoriaStrategy } from './strategies/PorCategoriaStrategy.js';
import { SimilitudBasicaStrategy } from './strategies/SimilitudBasicaStrategy.js';

type StrategyType = 'parcial' | 'categoria' | 'similitud';

/**
 * Factory Method para estrategias de sugerencias.
 *
 * Lógica de selección automática según el query:
 *  1. Si el query contiene términos que parecen categorías → PorCategoriaStrategy
 *  2. Si el query tiene 4+ caracteres y parece un nombre → CoincidenciaParcialStrategy
 *  3. Fallback general → SimilitudBasicaStrategy
 *
 * También permite selección manual mediante el parámetro `tipo`.
 */
export class SugerenciaFactory {
  private static readonly strategies: Record<StrategyType, SugerenciaStrategy> = {
    parcial: new CoincidenciaParcialStrategy(),
    categoria: new PorCategoriaStrategy(),
    similitud: new SimilitudBasicaStrategy(),
  };

  private static readonly categoryKeywords = [
    'analg', 'antibio', 'antiinf', 'antial', 'gastro',
    'antidiab', 'cardio', 'respir', 'cortico', 'psico', 'suplem',
  ];

  /**
   * Crea/obtiene la estrategia correcta para el query dado.
   * @param query - El texto de búsqueda del usuario
   * @param tipo  - Fuerza una estrategia específica (opcional)
   */
  static create(query: string, tipo?: string): SugerenciaStrategy {
    // Si se pide manualmente una estrategia válida, usarla
    if (tipo && tipo in SugerenciaFactory.strategies) {
      return SugerenciaFactory.strategies[tipo as StrategyType];
    }

    const q = query.toLowerCase().trim();

    // ¿Parece una búsqueda por categoría?
    const esCategoria = SugerenciaFactory.categoryKeywords.some((kw) =>
      q.includes(kw)
    );
    if (esCategoria) {
      return SugerenciaFactory.strategies.categoria;
    }

    // ¿Tiene suficientes caracteres para coincidencia precisa?
    if (q.length >= 3) {
      return SugerenciaFactory.strategies.parcial;
    }

    // Fallback general
    return SugerenciaFactory.strategies.similitud;
  }

  /**
   * Ejecuta todas las estrategias y combina resultados únicos.
   * Útil para ofrecer sugerencias ricas cuando los resultados son escasos.
   */
  static createAll(): SugerenciaStrategy[] {
    return Object.values(SugerenciaFactory.strategies);
  }
}
