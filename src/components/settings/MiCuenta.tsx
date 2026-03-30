import { useState, useEffect, type FormEvent } from 'react';
import { useToast } from '../../hooks/useToast';
import './MiCuenta.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

interface UsuarioAPI {
  id: number;
  name: string;
  email: string;
  role: string;
  telefono?: string;
  created_at: string;
}

interface MiCuentaProps {
  onGoHome: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  farmaceutico: 'Farmacéutico',
  cliente: 'Cliente',
};

export default function MiCuenta({ onGoHome }: MiCuentaProps) {
  const { addToast } = useToast();

  const tokenActual: string = localStorage.getItem('token') || '';

  console.log('[MiCuenta] Componente montado');
  console.log('[MiCuenta] Token en localStorage:', tokenActual ? `"${tokenActual.slice(0, 12)}..."` : 'NO HAY TOKEN');

  const [usuario, setUsuario]     = useState<UsuarioAPI | null>(null);
  const [cargando, setCargando]   = useState(true);
  const [nombre, setNombre]       = useState('');
  const [telefono, setTelefono]   = useState('');
  const [password, setPassword]   = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [errNombre,    setErrNombre]    = useState('');
  const [errPassword,  setErrPassword]  = useState('');
  const [errConfirmar, setErrConfirmar] = useState('');

  useEffect(() => {
    if (!tokenActual) {
      console.warn('[MiCuenta] No hay token — el usuario no está autenticado.');
      setCargando(false);
      return;
    }

    console.log('[MiCuenta] Llamando GET /api/usuarios/me ...');

    fetch(`${API_BASE}/api/usuarios/me`, {
      headers: { 'Authorization': `Bearer ${tokenActual}` },
    })
      .then(r => {
        console.log('[MiCuenta] GET /api/usuarios/me — HTTP status:', r.status);
        return r.json();
      })
      .then(d => {
        console.log('[MiCuenta] Respuesta /me:', d);
        if (d.success && d.data) {
          console.log('[MiCuenta] Usuario cargado:', { id: d.data.id, email: d.data.email, role: d.data.role });
          setUsuario(d.data);
          setNombre(d.data.name);
          setTelefono(d.data.telefono || '');
        } else {
          console.error('[MiCuenta] La respuesta no trajo datos:', d);
        }
      })
      .catch(err => {
        console.error('[MiCuenta] Error de red en GET /me:', err);
        addToast('No se pudo cargar la información del usuario.', 'error');
      })
      .finally(() => setCargando(false));
  }, [tokenActual]);

  const handleNombreChange = (val: string) => {
    setNombre(val);
    setErrNombre(val.trim().length > 0 && val.trim().length < 2 ? 'Mínimo 2 caracteres.' : '');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setErrPassword(val.length > 0 && val.length < 4 ? 'Mínimo 4 caracteres.' : '');
    if (confirmar && val !== confirmar) setErrConfirmar('Las contraseñas no coinciden.');
    else setErrConfirmar('');
  };

  const handleConfirmarChange = (val: string) => {
    setConfirmar(val);
    setErrConfirmar(val && val !== password ? 'Las contraseñas no coinciden.' : '');
  };

  const hayErrores = !!errNombre || !!errPassword || !!errConfirmar;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    if (nombre.trim().length < 2) { setErrNombre('Mínimo 2 caracteres.'); return; }
    if (password && password.length < 4) { setErrPassword('Mínimo 4 caracteres.'); return; }
    if (password && password !== confirmar) { setErrConfirmar('Las contraseñas no coinciden.'); return; }

    const payload: Record<string, string> = { name: nombre.trim() };
    if (telefono.trim()) payload.telefono = telefono.trim();
    if (password)        payload.password  = password;

    console.log(`[MiCuenta] Enviando PUT /api/usuarios/${usuario.id}`, {
      ...payload,
      password: payload.password ? '***' : undefined,
    });

    setGuardando(true);
    try {
      const res = await fetch(`${API_BASE}/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenActual}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      console.log(`[MiCuenta] PUT /api/usuarios/${usuario.id} — status: ${res.status} | success: ${data.success}`);

      if (!res.ok || !data.success) {
        const msg = data.errors?.[0] || data.message || 'Error al guardar.';
        console.error('[MiCuenta] Error del servidor:', msg);
        addToast(msg, 'error');
        return;
      }

      // Actualizar nombre en localStorage
      const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...userLocal, name: nombre.trim() }));
      console.log('[MiCuenta] Guardado OK. localStorage actualizado.');

      setUsuario(data.data);
      setPassword('');
      setConfirmar('');
      addToast('Cambios guardados correctamente.', 'success');
    } catch (err) {
      console.error('[MiCuenta] Error de conexión en PUT:', err);
      addToast('Error de conexión. Verifica tu red.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <main className="mc-container">
        <div className="mc-card">
          <p className="mc-cargando">Cargando información...</p>
        </div>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="mc-container">
        <div className="mc-card">
          <p className="mc-error-msg">
            No se encontró información de tu cuenta.{' '}
            <button className="mc-link-btn" onClick={onGoHome}>Volver al inicio</button>
          </p>
        </div>
      </main>
    );
  }

  const fechaRegistro = new Date(usuario.created_at).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <main className="mc-container">
      <div className="mc-card">

        <div className="mc-header">
          <div className="mc-avatar" aria-hidden="true">
            {usuario.name.trim().charAt(0).toUpperCase()}
          </div>
          <div className="mc-header-info">
            <h1 className="mc-title">Mi cuenta</h1>
            <p className="mc-subtitle">Miembro desde {fechaRegistro}</p>
          </div>
          <span className={`mc-role-badge mc-role-${usuario.role}`}>
            {ROLE_LABEL[usuario.role] ?? usuario.role}
          </span>
        </div>

        <hr className="mc-divider" />

        <form onSubmit={handleSubmit} noValidate>

          <section className="mc-section">
            <h2 className="mc-section-title">Datos personales</h2>

            <div className="mc-field">
              <label htmlFor="mc-nombre">Nombre</label>
              <input
                id="mc-nombre"
                type="text"
                value={nombre}
                onChange={e => handleNombreChange(e.target.value)}
                placeholder="Tu nombre completo"
                autoComplete="name"
                disabled={guardando}
              />
              {errNombre && <span className="mc-field-error">{errNombre}</span>}
            </div>

            <div className="mc-field">
              <label htmlFor="mc-email">Correo electrónico</label>
              <input
                id="mc-email"
                type="email"
                value={usuario.email}
                readOnly
                className="mc-readonly"
                title="El correo no se puede cambiar"
              />
              <span className="mc-field-hint">El correo electrónico no es editable.</span>
            </div>

            <div className="mc-field">
              <label htmlFor="mc-telefono">
                Teléfono <span className="mc-opcional">(opcional)</span>
              </label>
              <input
                id="mc-telefono"
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="Ej: 300 123 4567"
                autoComplete="tel"
                disabled={guardando}
              />
            </div>
          </section>

          <hr className="mc-divider" />

          <section className="mc-section">
            <h2 className="mc-section-title">Cambiar contraseña</h2>
            <p className="mc-section-desc">Deja los campos vacíos si no deseas cambiarla.</p>

            <div className="mc-field">
              <label htmlFor="mc-password">Nueva contraseña</label>
              <input
                id="mc-password"
                type="password"
                value={password}
                onChange={e => handlePasswordChange(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
                disabled={guardando}
              />
              {errPassword && <span className="mc-field-error">{errPassword}</span>}
            </div>

            <div className="mc-field">
              <label htmlFor="mc-confirmar">Confirmar contraseña</label>
              <input
                id="mc-confirmar"
                type="password"
                value={confirmar}
                onChange={e => handleConfirmarChange(e.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                disabled={guardando || !password}
              />
              {errConfirmar && <span className="mc-field-error">{errConfirmar}</span>}
            </div>
          </section>

          <div className="mc-actions">
            <button
              type="submit"
              className="mc-btn-guardar"
              disabled={guardando || hayErrores}
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
