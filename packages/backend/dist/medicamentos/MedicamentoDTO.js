export function validateCreateMedicamento(body) {
    const errors = [];
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
        errors.push('name: requerido, mínimo 2 caracteres');
    }
    if (!body.lab || typeof body.lab !== 'string' || body.lab.trim().length < 2) {
        errors.push('lab: requerido, mínimo 2 caracteres');
    }
    if (body.active !== undefined && typeof body.active !== 'boolean') {
        errors.push('active: debe ser true o false');
    }
    if (body.categoria_id !== undefined && typeof body.categoria_id !== 'number') {
        errors.push('categoria_id: debe ser un número');
    }
    return errors;
}
export function validateUpdateMedicamento(body) {
    const errors = [];
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 2)) {
        errors.push('name: mínimo 2 caracteres');
    }
    if (body.lab !== undefined && (typeof body.lab !== 'string' || body.lab.trim().length < 2)) {
        errors.push('lab: mínimo 2 caracteres');
    }
    if (body.active !== undefined && typeof body.active !== 'boolean') {
        errors.push('active: debe ser true o false');
    }
    if (body.categoria_id !== undefined && typeof body.categoria_id !== 'number') {
        errors.push('categoria_id: debe ser un número');
    }
    return errors;
}
//# sourceMappingURL=MedicamentoDTO.js.map