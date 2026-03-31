import Database from '../../shared/db.js';
export class PorCategoriaStrategy {
    constructor() {
        this.nombre = 'por_categoria';
        this.categoriasConocidas = [
            'analgesicos',
            'antibioticos',
            'antiinflamatorios',
            'antialergicos',
            'gastrointestinales',
            'antidiabeticos',
            'cardiovasculares',
            'respiratorios',
            'corticosteroides',
            'psicofarmacos',
            'suplementos',
        ];
    }
    async buscar(query, medicamentos) {
        const q = query.toLowerCase().trim();
        const categoriaCoincidente = this.categoriasConocidas.find((cat) => cat.includes(q) || q.includes(cat.slice(0, 4)));
        if (!categoriaCoincidente)
            return [];
        const pool = Database.getInstance().getPool();
        const catResult = await pool.query("SELECT id FROM categorias WHERE LOWER(nombre) LIKE $1", [`%${categoriaCoincidente}%`]);
        if (catResult.rows.length === 0)
            return [];
        const categoriaId = catResult.rows[0].id;
        return medicamentos
            .filter((med) => med.active && med.categoria_id === categoriaId)
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
//# sourceMappingURL=PorCategoriaStrategy.js.map