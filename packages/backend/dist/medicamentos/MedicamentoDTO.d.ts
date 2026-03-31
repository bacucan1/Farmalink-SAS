export interface CreateMedicamentoDTO {
    name: string;
    lab: string;
    active?: boolean;
    description?: string;
    categoria_id?: number;
}
export interface UpdateMedicamentoDTO {
    name?: string;
    lab?: string;
    active?: boolean;
    description?: string;
    categoria_id?: number;
}
export interface MedicamentoResponseDTO {
    id: number;
    name: string;
    lab: string;
    active: boolean;
    description?: string;
    categoria_id?: number;
    categoria_nombre?: string;
    created_at: Date;
}
export declare function validateCreateMedicamento(body: any): string[];
export declare function validateUpdateMedicamento(body: any): string[];
//# sourceMappingURL=MedicamentoDTO.d.ts.map