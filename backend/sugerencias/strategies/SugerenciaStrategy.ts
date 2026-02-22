import { IMedicamento } from '../../models/Medicamento.js';

export interface SugerenciaResult {
  _id: string;
  name: string;
  lab: string;
  category?: string;
  description?: string;
  estrategiaUsada: string;
}

export interface SugerenciaStrategy {
  nombre: string;
  buscar(query: string, medicamentos: IMedicamento[]): SugerenciaResult[];
}
