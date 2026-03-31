/**
 * Estrategia: Precio Reciente
 * Ordena por la fecha de actualización más reciente primero.
 * Útil para ver qué farmacias tienen precios actualizados recientemente.
 */
export class PrecioRecienteStrategy {
    constructor() {
        this.nombre = 'precio_reciente';
    }
    ordenar(precios) {
        return [...precios].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
}
//# sourceMappingURL=PrecioRecienteStrategy.js.map