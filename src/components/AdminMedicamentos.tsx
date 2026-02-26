import { useState, useEffect } from 'react';
import './AdminMedicamentos.css';

interface Farmacia {
  _id: string;
  name: string;
}

interface Medicamento {
  _id: string;
  name: string;
  lab: string;
  active: boolean;
  description?: string;
  category?: string;
  farmaciaId: Farmacia | string;
}

interface FormData {
  name: string;
  lab: string;
  active: boolean;
  description: string;
  category: string;
  farmaciaId: string;
}

const CATEGORIAS = [
  'Analgésicos', 'Antibióticos', 'Antiinflamatorios', 'Antialérgicos',
  'Gastrointestinales', 'Antidiabéticos', 'Cardiovasculares',
  'Respiratorios', 'Corticosteroides', 'Psicofármacos', 'Suplementos',
];

const EMPTY_FORM: FormData = {
  name: '', lab: '', active: true, description: '', category: '', farmaciaId: '',
};

const TOKEN_KEY = 'token';

async function getToken(): Promise<string> {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@farmalink.com' }),
    });
    const data = await res.json();
    token = data.token;
    localStorage.setItem(TOKEN_KEY, token!);
  }
  return token!;
}

export function AdminMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Confirmación eliminar
  const [confirmDelete, setConfirmDelete] = useState<Medicamento | null>(null);

  // Filtro
  const [filtro, setFiltro] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [medRes, farRes] = await Promise.all([
        fetch('http://localhost:4000/api/medicamentos', { headers }),
        fetch('http://localhost:4000/api/farmacias', { headers }),
      ]);
      const medData = await medRes.json();
      const farData = await farRes.json();
      setMedicamentos(medData.data || medData);
      setFarmacias(farData);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function abrirCrear() {
    setEditando(null);
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setModalOpen(true);
  }

  function abrirEditar(med: Medicamento) {
    setEditando(med);
    setForm({
      name: med.name,
      lab: med.lab,
      active: med.active,
      description: med.description || '',
      category: med.category || '',
      farmaciaId: typeof med.farmaciaId === 'object' ? med.farmaciaId._id : med.farmaciaId,
    });
    setFormErrors([]);
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setEditando(null);
    setForm(EMPTY_FORM);
    setFormErrors([]);
  }

  async function guardar() {
    const errors: string[] = [];
    if (!form.name.trim() || form.name.trim().length < 2) errors.push('Nombre: mínimo 2 caracteres');
    if (!form.lab.trim() || form.lab.trim().length < 2) errors.push('Laboratorio: mínimo 2 caracteres');
    if (!form.farmaciaId) errors.push('Debe seleccionar una farmacia');

    if (errors.length > 0) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      const token = await getToken();
      const url = editando
        ? `http://localhost:4000/api/medicamentos/${editando._id}`
        : 'http://localhost:4000/api/medicamentos';
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormErrors(data.errors || [data.message || 'Error al guardar']);
        return;
      }

      cerrarModal();
      await loadAll();
      showSuccess(editando ? '✅ Medicamento actualizado' : '✅ Medicamento creado');
    } catch {
      setFormErrors(['Error de conexión']);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(med: Medicamento) {
    try {
      const token = await getToken();
      await fetch(`http://localhost:4000/api/medicamentos/${med._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDelete(null);
      await loadAll();
      showSuccess('🗑️ Medicamento eliminado');
    } catch {
      setError('Error al eliminar');
    }
  }

  const filtrados = medicamentos.filter(m =>
    m.name.toLowerCase().includes(filtro.toLowerCase()) ||
    m.lab.toLowerCase().includes(filtro.toLowerCase()) ||
    (m.category?.toLowerCase().includes(filtro.toLowerCase()) ?? false)
  );

  if (loading) return <div className="admin-loading">Cargando panel...</div>;

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">⚙️ Panel de Administración</h2>
          <p className="admin-subtitle">Gestión de medicamentos</p>
        </div>
        <button className="btn-nuevo" onClick={abrirCrear}>+ Nuevo Medicamento</button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {successMsg && <div className="admin-success">{successMsg}</div>}

      <input
        className="admin-filtro"
        placeholder="Filtrar por nombre, laboratorio o categoría..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Laboratorio</th>
              <th>Categoría</th>
              <th>Farmacia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} className="admin-empty">No hay medicamentos</td></tr>
            ) : filtrados.map(med => (
              <tr key={med._id}>
                <td className="td-name">{med.name}</td>
                <td>{med.lab}</td>
                <td>{med.category || '—'}</td>
                <td>{typeof med.farmaciaId === 'object' ? med.farmaciaId.name : '—'}</td>
                <td>
                  <span className={`badge ${med.active ? 'badge-active' : 'badge-inactive'}`}>
                    {med.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="td-actions">
                  <button className="btn-edit" onClick={() => abrirEditar(med)}>✏️ Editar</button>
                  <button className="btn-delete" onClick={() => setConfirmDelete(med)}>🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="admin-count">Total: {filtrados.length} medicamentos</p>

      {/* Modal crear/editar */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? '✏️ Editar Medicamento' : '➕ Nuevo Medicamento'}</h3>
              <button className="modal-close" onClick={cerrarModal}>✕</button>
            </div>

            {formErrors.length > 0 && (
              <div className="form-errors">
                {formErrors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Acetaminofén 500mg" />
              </div>
              <div className="form-group">
                <label>Laboratorio *</label>
                <input value={form.lab} onChange={e => setForm({ ...form, lab: e.target.value })} placeholder="Ej: Bayer S.A." />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">— Seleccionar —</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Farmacia *</label>
                <select value={form.farmaciaId} onChange={e => setForm({ ...form, farmaciaId: e.target.value })}>
                  <option value="">— Seleccionar —</option>
                  {farmacias.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción opcional..." rows={2} />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={form.active ? 'true' : 'false'} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-guardar" onClick={guardar} disabled={saving}>
                {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box modal-confirm" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{confirmDelete.name}</strong>?</p>
            <p className="confirm-warning">Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-delete-confirm" onClick={() => eliminar(confirmDelete)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
