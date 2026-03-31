/**
 * Estrategia 1: Coincidencia Parcial
 * Busca medicamentos cuyo nombre comience con el query (startsWith, case-insensitive).
 * Es la más precisa y se activa por defecto cuando el usuario escribe el inicio del nombre.
 */
export class CoincidenciaParcialStrategy {
    constructor() {
        this.nombre = 'coincidencia_parcial';
    }
    buscar(query, medicamentos) {
        const q = query.toLowerCase().trim();
        return medicamentos
            .filter((med) => med.active && med.name.toLowerCase().startsWith(q))
            .map((med) => ({
            _id: med._id.toString(),
            name: med.name,
            lab: med.lab,
            categoria_id: med.categoria_id,
            description: med.description,
            category: med.categoria_nombre || med.category || '',
            categoria_nombre: med.categoria_nombre || med.category || '',
            estrategiaUsada: this.nombre,
        }));
    }
}
//# sourceMappingURL=CoincidenciaParcialStrategy.js.map