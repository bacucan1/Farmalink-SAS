/**
 * DTO (Data Transfer Object) para Precio.
 */
export interface UpdatePrecioDTO {
    precio: number;
    medicamento_id?: number;
}
export interface PrecioComparacionDTO {
    medicamento: {
        _id: string;
        name: string;
        lab: string;
        category?: string;
        description?: string;
    };
    mejorPrecio: {
        precio: number;
        farmaciaNombre: string;
        farmaciaId: string | object;
        fecha: Date;
    };
    listaOrdenada: {
        precioId: string;
        precio: number;
        farmaciaNombre: string;
        farmaciaId: string | object;
        fecha: Date;
        estrategiaUsada: string;
    }[];
}
export declare function validateUpdatePrecio(body: any): string[];
//# sourceMappingURL=PrecioDTO.d.ts.map