export interface HistorialPrecioInput {
    precio_id: number;
    medicamento_id: number;
    farmacia_id: number;
    precio_anterior: number;
    precio_nuevo: number;
    quien_cambio?: string;
}
export declare class PrecioHistorialService {
    static registrarCambio(input: HistorialPrecioInput): Promise<void>;
    static obtenerHistorialPorMedicamento(medicamentoId: number): Promise<any[]>;
    static obtenerHistorialPorPrecio(precioId: number): Promise<any[]>;
}
//# sourceMappingURL=PrecioHistorialService.d.ts.map