/**
 * DTO (Data Transfer Object) para Precio.
 */
export function validateUpdatePrecio(body) {
    const errors = [];
    if (body.precio === undefined || body.precio === null) {
        errors.push('precio: requerido');
    }
    else if (typeof body.precio !== 'number' || isNaN(body.precio)) {
        errors.push('precio: debe ser un número');
    }
    else if (body.precio < 0) {
        errors.push('precio: no puede ser negativo');
    }
    if (body.medicamento_id !== undefined && typeof body.medicamento_id !== 'number') {
        errors.push('medicamento_id: debe ser un número');
    }
    return errors;
}
//# sourceMappingURL=PrecioDTO.js.map