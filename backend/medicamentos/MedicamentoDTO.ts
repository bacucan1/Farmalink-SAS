/**
 * DTO (Data Transfer Object) para Medicamento.
 * Define exactamente qué campos se reciben y se devuelven,
 * separando la capa de red del modelo de base de datos.
 */

export interface CreateMedicamentoDTO {
  name: string;
  lab: string;
  active?: boolean;
  description?: string;
  category?: string;
  farmaciaId: string;
}

export interface UpdateMedicamentoDTO {
  name?: string;
  lab?: string;
  active?: boolean;
  description?: string;
  category?: string;
  farmaciaId?: string;
}

export interface MedicamentoResponseDTO {
  _id: string;
  name: string;
  lab: string;
  active: boolean;
  description?: string;
  category?: string;
  farmaciaId: string | object;
  createdAt: Date;
}

// Validaciones del DTO
export function validateCreateMedicamento(body: any): string[] {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('name: requerido, mínimo 2 caracteres');
  }
  if (!body.lab || typeof body.lab !== 'string' || body.lab.trim().length < 2) {
    errors.push('lab: requerido, mínimo 2 caracteres');
  }
  if (!body.farmaciaId || typeof body.farmaciaId !== 'string') {
    errors.push('farmaciaId: requerido, debe ser un ID válido');
  }
  if (body.active !== undefined && typeof body.active !== 'boolean') {
    errors.push('active: debe ser true o false');
  }

  return errors;
}

export function validateUpdateMedicamento(body: any): string[] {
  const errors: string[] = [];

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 2)) {
    errors.push('name: mínimo 2 caracteres');
  }
  if (body.lab !== undefined && (typeof body.lab !== 'string' || body.lab.trim().length < 2)) {
    errors.push('lab: mínimo 2 caracteres');
  }
  if (body.active !== undefined && typeof body.active !== 'boolean') {
    errors.push('active: debe ser true o false');
  }
  if (body.farmaciaId !== undefined && typeof body.farmaciaId !== 'string') {
    errors.push('farmaciaId: debe ser un ID válido');
  }

  return errors;
}
