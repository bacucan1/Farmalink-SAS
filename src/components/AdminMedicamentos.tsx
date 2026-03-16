import { useState, useEffect } from 'react';
import './AdminMedicamentos.css';

interface Categoria {
  id: number;
  nombre: string;
}

interface Farmacia {
  _id: string;
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

interface Medicamento {
  _id: string;
  id?: number;
  name: string;
  lab: string;
  active: boolean;
  description?: string;
  category?: string;
  categoria_id?: number;
  categoria_nombre?: string;
  farmaciaId: Farmacia | string;
  farmacia_nombre?: string;
}

interface FarmaciaFormData {
  name: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
}

interface FormData {
  name: string;
  lab: string;
  active: boolean;
  description: string;
  categoria_id: number | '';
  precio: string;
}

const EMPTY_FARMACIA_FORM: FarmaciaFormData = {
  name: '', address: '', phone: '', lat: '', lng: '',
};

const EMPTY_FORM: FormData = {
  name: '', lab: '', active: true, description: '', categoria_id: '', precio: '',
};

const TOKEN_KEY = 'token';

const GATEWAY = import.meta.env.VITE_API_URL || '';

async function getToken(): Promise<string> {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const res = await fetch(`${GATEWAY}/api/auth/login`, {
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
  const [activeTab, setActiveTab] = useState<'medicamentos' | 'farmacias'>('medicamentos');
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal medicamentos
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal farmacias
  const [farmaciaModalOpen, setFarmaciaModalOpen] = useState(false);
  const [editandoFarmacia, setEditandoFarmacia] = useState<Farmacia | null>(null);
  const [farmaciaForm, setFarmaciaForm] = useState<FarmaciaFormData>(EMPTY_FARMACIA_FORM);
  const [farmaciaFormErrors, setFarmaciaFormErrors] = useState<string[]>([]);
  const [savingFarmacia, setSavingFarmacia] = useState(false);

  // Confirmación eliminar
  const [confirmDelete, setConfirmDelete] = useState<Medicamento | null>(null);
  const [confirmDeleteFarmacia, setConfirmDeleteFarmacia] = useState<Farmacia | null>(null);

  // Filtro
  const [filtro, setFiltro] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [medRes, farRes, catRes] = await Promise.all([
        fetch(`${GATEWAY}/api/medicamentos`, { headers }),
        fetch(`${GATEWAY}/api/farmacias`, { headers }),
        fetch(`${GATEWAY}/api/categorias`, { headers }),
      ]);
      
      if (!medRes.ok || !farRes.ok || !catRes.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const medData = await medRes.json();
      const farData = await farRes.json();
      const catData = await catRes.json();
      setMedicamentos(Array.isArray(medData.data) ? medData.data : Array.isArray(medData) ? medData : []);
      setFarmacias(Array.isArray(farData.data) ? farData.data : Array.isArray(farData) ? farData : []);
      setCategorias(Array.isArray(catData.data) ? catData.data : Array.isArray(catData) ? catData : []);
    } catch {
      setError('Error al cargar datos');
      setMedicamentos([]);
      setFarmacias([]);
      setCategorias([]);
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
      categoria_id: med.categoria_id || '',
      precio: '',
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

    if (errors.length > 0) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      const token = await getToken();
      const url = editando
        ? `${GATEWAY}/api/medicamentos/${editando.id}`
        : `${GATEWAY}/api/medicamentos`;
      const method = editando ? 'PUT' : 'POST';

      const payload = {
        name: form.name.trim(),
        lab: form.lab.trim(),
        active: form.active,
        description: form.description?.trim() || null,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setFormErrors(['Acceso denegado. Se requiere rol de administrador.']);
        } else {
          setFormErrors(data.errors || [data.message || 'Error al guardar']);
        }
        return;
      }

      if (!editando && form.precio && Number(form.precio) > 0 && farmacias.length > 0) {
        const medId = data.data?.id;
        if (medId) {
          await fetch(`${GATEWAY}/api/precios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              medicamento_id: medId,
              farmacia_id: Number(farmacias[0].id),
              precio: Number(form.precio),
            }),
          });
        }
      }

      cerrarModal();
      await loadAll();
      showSuccess(editando ? 'Medicamento actualizado' : 'Medicamento creado');
    } catch {
      setFormErrors(['Error de conexión']);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(med: Medicamento) {
    try {
      const token = await getToken();
      await fetch(`${GATEWAY}/api/medicamentos/${med.id}`, {
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

  function abrirCrearFarmacia() {
    setEditandoFarmacia(null);
    setFarmaciaForm(EMPTY_FARMACIA_FORM);
    setFarmaciaFormErrors([]);
    setFarmaciaModalOpen(true);
  }

  function abrirEditarFarmacia(far: Farmacia) {
    setEditandoFarmacia(far);
    setFarmaciaForm({
      name: far.name || '',
      address: far.address || '',
      phone: far.phone || '',
      lat: far.lat?.toString() || far.latitude?.toString() || '',
      lng: far.lng?.toString() || far.longitude?.toString() || '',
    });
    setFarmaciaFormErrors([]);
    setFarmaciaModalOpen(true);
  }

  function cerrarFarmaciaModal() {
    setFarmaciaModalOpen(false);
    setEditandoFarmacia(null);
    setFarmaciaForm(EMPTY_FARMACIA_FORM);
    setFarmaciaFormErrors([]);
  }

  async function guardarFarmacia() {
    const errors: string[] = [];
    if (!farmaciaForm.name.trim() || farmaciaForm.name.trim().length < 2) {
      errors.push('Nombre: mínimo 2 caracteres');
    }

    if (errors.length > 0) { setFarmaciaFormErrors(errors); return; }

    setSavingFarmacia(true);
    try {
      const token = await getToken();
      const url = editandoFarmacia
        ? `${GATEWAY}/api/farmacias/${editandoFarmacia.id}`
        : `${GATEWAY}/api/farmacias`;
      const method = editandoFarmacia ? 'PUT' : 'POST';

      const payload = {
        name: farmaciaForm.name.trim(),
        address: farmaciaForm.address?.trim() || null,
        phone: farmaciaForm.phone?.trim() || null,
        lat: farmaciaForm.lat ? Number(farmaciaForm.lat) : null,
        lng: farmaciaForm.lng ? Number(farmaciaForm.lng) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setFarmaciaFormErrors(['Acceso denegado. Se requiere rol de administrador.']);
        } else {
          setFarmaciaFormErrors(data.errors || [data.message || 'Error al guardar']);
        }
        return;
      }

      cerrarFarmaciaModal();
      await loadAll();
      showSuccess(editandoFarmacia ? 'Farmacia actualizada' : 'Farmacia creada');
    } catch {
      setFarmaciaFormErrors(['Error de conexión']);
    } finally {
      setSavingFarmacia(false);
    }
  }

  async function eliminarFarmacia(far: Farmacia) {
    try {
      const token = await getToken();
      await fetch(`${GATEWAY}/api/farmacias/${far.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDeleteFarmacia(null);
      await loadAll();
      showSuccess('🗑️ Farmacia eliminada');
    } catch {
      setError('Error al eliminar');
    }
  }

  const filtradosFarmacias = farmacias.filter(f => {
    return (
      f.name.toLowerCase().includes(filtro.toLowerCase()) ||
      (f.address?.toLowerCase().includes(filtro.toLowerCase())) ||
      (f.phone?.toLowerCase().includes(filtro.toLowerCase()))
    );
  });

  const filtrados = medicamentos.filter(m => {
    const catNombre = categorias.find(c => c.id === m.categoria_id)?.nombre || m.categoria_nombre || m.category || '';
    const farNombre = typeof m.farmaciaId === 'object' ? m.farmaciaId.name : (farmacias.find(f => f.id === Number(m.farmaciaId))?.name || '');
    return (
      m.name.toLowerCase().includes(filtro.toLowerCase()) ||
      m.lab.toLowerCase().includes(filtro.toLowerCase()) ||
      catNombre.toLowerCase().includes(filtro.toLowerCase()) ||
      farNombre.toLowerCase().includes(filtro.toLowerCase())
    );
  });

  function getCategoriaNombre(med: Medicamento): string {
    if (med.categoria_nombre) return med.categoria_nombre;
    if (med.category) return med.category;
    const cat = categorias.find(c => c.id === med.categoria_id);
    return cat?.nombre || '—';
  }

  function getFarmaciaNombre(med: Medicamento): string {
    if (typeof med.farmaciaId === 'object') return med.farmaciaId.name;
    if ((med as any).farmaciaNombre) return (med as any).farmaciaNombre;
    const far = farmacias.find(f => f.id === Number(med.farmaciaId));
    return far?.name || '—';
  }

  if (loading) return <div className="admin-loading">Cargando panel...</div>;

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">⚙️ Panel de Administración</h2>
          <p className="admin-subtitle">
            {activeTab === 'medicamentos' ? 'Gestión de medicamentos' : 'Gestión de farmacias'}
          </p>
        </div>
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'medicamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicamentos')}
          >
            💊 Medicamentos
          </button>
          <button 
            className={`admin-tab ${activeTab === 'farmacias' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmacias')}
          >
            🏥 Farmacias
          </button>
        </div>
      </div>

      <div className="admin-header-actions">
        {activeTab === 'medicamentos' ? (
          <button className="btn-nuevo" onClick={abrirCrear}>+ Nuevo Medicamento</button>
        ) : (
          <button className="btn-nuevo" onClick={abrirCrearFarmacia}>+ Nueva Farmacia</button>
        )}
      </div>

      {error && <div className="admin-error">{error}</div>}
      {successMsg && <div className="admin-success">{successMsg}</div>}

      <input
        className="admin-filtro"
        placeholder={activeTab === 'medicamentos' 
          ? "Filtrar por nombre, laboratorio o categoría..." 
          : "Filtrar por nombre, dirección o teléfono..."}
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      {activeTab === 'medicamentos' ? (
        <>
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
                    <td>{getCategoriaNombre(med)}</td>
                    <td>{getFarmaciaNombre(med)}</td>
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
        </>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradosFarmacias.length === 0 ? (
                  <tr><td colSpan={5} className="admin-empty">No hay farmacias</td></tr>
                ) : filtradosFarmacias.map(far => (
                  <tr key={far._id}>
                    <td className="td-name">{far.name}</td>
                    <td>{far.address || '—'}</td>
                    <td>{far.phone || '—'}</td>
                    <td>
                      {far.lat !== undefined && far.lng !== undefined 
                        ? `${far.lat}, ${far.lng}`
                        : far.latitude !== undefined && far.longitude !== undefined
                          ? `${far.latitude}, ${far.longitude}`
                          : '—'}
                    </td>
                    <td className="td-actions">
                      <button className="btn-edit" onClick={() => abrirEditarFarmacia(far)}>✏️ Editar</button>
                      <button className="btn-delete" onClick={() => setConfirmDeleteFarmacia(far)}>🗑️ Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="admin-count">Total: {filtradosFarmacias.length} farmacias</p>
        </>
      )}

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
                <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value ? Number(e.target.value) : '' })}>
                  <option value="">— Seleccionar —</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              {!editando && (
                <div className="form-group">
                  <label>Precio inicial</label>
                  <input 
                    type="number" 
                    value={form.precio} 
                    onChange={e => setForm({ ...form, precio: e.target.value })} 
                    placeholder="Ej: 15000" 
                    min="0"
                  />
                </div>
              )}
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

      {/* Modal crear/editar farmacia */}
      {farmaciaModalOpen && (
        <div className="modal-overlay" onClick={cerrarFarmaciaModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editandoFarmacia ? '✏️ Editar Farmacia' : '➕ Nueva Farmacia'}</h3>
              <button className="modal-close" onClick={cerrarFarmaciaModal}>✕</button>
            </div>

            {farmaciaFormErrors.length > 0 && (
              <div className="form-errors">
                {farmaciaFormErrors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre *</label>
                <input 
                  value={farmaciaForm.name} 
                  onChange={e => setFarmaciaForm({ ...farmaciaForm, name: e.target.value })} 
                  placeholder="Ej: Farmacia Central" 
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  value={farmaciaForm.phone} 
                  onChange={e => setFarmaciaForm({ ...farmaciaForm, phone: e.target.value })} 
                  placeholder="Ej: 300 123 4567" 
                />
              </div>
              <div className="form-group full-width">
                <label>Dirección</label>
                <input 
                  value={farmaciaForm.address} 
                  onChange={e => setFarmaciaForm({ ...farmaciaForm, address: e.target.value })} 
                  placeholder="Ej: Calle 123 #45-67" 
                />
              </div>
              <div className="form-group">
                <label>Latitud</label>
                <input 
                  type="number"
                  step="any"
                  value={farmaciaForm.lat} 
                  onChange={e => setFarmaciaForm({ ...farmaciaForm, lat: e.target.value })} 
                  placeholder="Ej: 4.7110" 
                />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input 
                  type="number"
                  step="any"
                  value={farmaciaForm.lng} 
                  onChange={e => setFarmaciaForm({ ...farmaciaForm, lng: e.target.value })} 
                  placeholder="Ej: -74.0721" 
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={cerrarFarmaciaModal}>Cancelar</button>
              <button className="btn-guardar" onClick={guardarFarmacia} disabled={savingFarmacia}>
                {savingFarmacia ? 'Guardando...' : editandoFarmacia ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar farmacia */}
      {confirmDeleteFarmacia && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteFarmacia(null)}>
          <div className="modal-box modal-confirm" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{confirmDeleteFarmacia.name}</strong>?</p>
            <p className="confirm-warning">Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setConfirmDeleteFarmacia(null)}>Cancelar</button>
              <button className="btn-delete-confirm" onClick={() => eliminarFarmacia(confirmDeleteFarmacia)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
