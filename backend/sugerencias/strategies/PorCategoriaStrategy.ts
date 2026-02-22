import { IMedicamento } from '../../models/Medicamento.js';
import { SugerenciaStrategy, SugerenciaResult } from './SugerenciaStrategy.js';

/**
 * Estrategia 2: Por Categoría
 * Busca medicamentos cuya categoría coincida parcialmente con el query.
 * Se activa cuando el query coincide con una categoría conocida más que con un nombre.
 * Útil para búsquedas del tipo "antibiotico", "analgesico", etc.
 */
export class PorCategoriaStrategy implements SugerenciaStrategy {
  nombre = 'por_categoria';

  private readonly categoriasConocidas = [
    'analgesicos',
    'antibioticos',
    'antiinflamatorios',
    'antialergicos',
    'gastrointestinales',
    'antidiabeticos',
    'cardiovasculares',
    'respiratorios',
    'corticosteroides',
    'psicofarmacos',
    'suplementos',
  ];

  buscar(query: string, medicamentos: IMedicamento[]): SugerenciaResult[] {
    const q = query.toLowerCase().trim();

    // Detectar si el query parece una categoría
    const categoriaCoincidente = this.categoriasConocidas.find((cat) =>
      cat.includes(q) || q.includes(cat.slice(0, 4))
    );

    if (!categoriaCoincidente) return [];

    return medicamentos
      .filter(
        (med) =>
          med.active &&
          med.category?.toLowerCase().includes(categoriaCoincidente)
      )
      .map((med) => ({
        _id: med._id as string,
        name: med.name,
        lab: med.lab,
        category: med.category,
        description: med.description,
        estrategiaUsada: this.nombre,
      }));
  }
}
