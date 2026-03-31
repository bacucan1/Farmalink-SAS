/**
 * Estrategia: Precio Descendente
 * Ordena de mayor a menor precio.
 * Útil para ver las opciones premium primero.
 */
export class PrecioDescendenteStrategy {
    constructor() {
        this.nombre = 'precio_descendente';
    }
    ordenar(precios) {
        return [...precios].sort((a, b) => b.precio - a.precio);
    }
}
//# sourceMappingURL=PrecioDescendenteStrategy.js.map