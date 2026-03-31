/**
 * Estrategia: Precio Ascendente
 * Ordena de menor a mayor precio — muestra primero la opción más económica.
 * Es la estrategia por defecto para comparación de precios.
 */
export class PrecioAscendenteStrategy {
    constructor() {
        this.nombre = 'precio_ascendente';
    }
    ordenar(precios) {
        return [...precios].sort((a, b) => a.precio - b.precio);
    }
}
//# sourceMappingURL=PrecioAscendenteStrategy.js.map