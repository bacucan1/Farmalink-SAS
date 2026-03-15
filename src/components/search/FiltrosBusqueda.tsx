import { useState, useEffect, useRef } from 'react';
import type { Sugerencia } from '../../types';
import './FiltrosBusqueda.css';

interface Categoria {
  id: number;
  nombre: string;
  total_medicamentos: string;
}

interface ResultadoBusqueda {
  id: number;
  name: string;
  lab: string;
  description?: string;
  categoria_nombre?: string;
  precio_minimo?: number;
  farmacias_count: number;
  score?: number;
}

interface FiltrosState {
  categoria: string;
  lab: string;
  precioMin: string;
  precioMax: string;
  disponible: string;
  orden: string;
}

interface FiltrosBusquedaProps {
  query: string;
  onSelect: (med: Sugerencia) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

const FILTROS_VACIOS: FiltrosState = {
  categoria:  '',
  lab:        '',
  precioMin:  '',
  precioMax:  '',
  disponible: '',
  orden:      'relevancia',
};

export function FiltrosBusqueda({ query, onSelect }: FiltrosBusquedaProps) {
  const [abierto,      setAbierto]      = useState(false);
  const [filtros,      setFiltros]      = useState<FiltrosState>(FILTROS_VACIOS);
  const [pendientes,   setPendientes]   = useState<FiltrosState>(FILTROS_VACIOS);
  const [categorias,   setCategorias]   = useState<Categoria[]>([]);
  const [laboratorios, setLaboratorios] = useState<{ lab: string }[]>([]);
  const [resultados,   setResultados]   = useState<ResultadoBusqueda[]>([]);
  const [cargando,     setCargando]     = useState(false);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [buscado,      setBuscado]      = useState(false);

  // Ref para siempre tener el query más reciente sin re-crear buscar()
  const queryRef = useRef(query);
  useEffect(() => { queryRef.current = query; }, [query]);

  const LIMIT = 8;

  // Cargar filtros disponibles al montar
  useEffect(() => {
    fetch(`${API_BASE}/api/busqueda/filtros`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategorias(data.filtros.categorias);
          setLaboratorios(data.filtros.laboratorios);
        }
      })
      .catch(() => {});
  }, []);

  // Contar filtros activos para el badge
  const filtrosActivos = [
    filtros.categoria, filtros.lab, filtros.precioMin,
    filtros.precioMax, filtros.disponible,
  ].filter(Boolean).length;

  // Función de búsqueda — lee query desde el ref para tener siempre el valor actual
  const buscar = async (f: FiltrosState, pg: number) => {
    setCargando(true);
    setBuscado(true);

    const q = queryRef.current;
    const params = new URLSearchParams();
    if (q)           params.set('q',          q);
    if (f.categoria) params.set('categoria',  f.categoria);
    if (f.lab)       params.set('lab',        f.lab);
    if (f.precioMin) params.set('precioMin',  f.precioMin);
    if (f.precioMax) params.set('precioMax',  f.precioMax);
    if (f.disponible) params.set('disponible', f.disponible);
    params.set('orden', f.orden || 'relevancia');
    params.set('page',  String(pg));
    params.set('limit', String(LIMIT));

    try {
      const res  = await fetch(`${API_BASE}/api/busqueda?${params}`);
      const data = await res.json();
      if (data.success) {
        setResultados(data.data);
        setTotal(data.paginacion.total);
        setTotalPaginas(data.paginacion.totalPaginas);
      }
    } catch {
      setResultados([]);
    } finally {
      setCargando(false);
    }
  };

  // Re-buscar si el query cambia y ya se había hecho una búsqueda
  const buscadoRef = useRef(buscado);
  useEffect(() => { buscadoRef.current = buscado; }, [buscado]);

  useEffect(() => {
    if (buscadoRef.current) {
      setPage(1);
      buscar(filtros, 1);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAplicar = () => {
    setFiltros(pendientes);
    setPage(1);
    buscar(pendientes, 1);
  };

  const handleLimpiar = () => {
    setPendientes(FILTROS_VACIOS);
    setFiltros(FILTROS_VACIOS);
    setPage(1);
    setResultados([]);
    setBuscado(false);
  };

  const handlePagina = (p: number) => {
    setPage(p);
    buscar(filtros, p);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSeleccionar = (r: ResultadoBusqueda) => {
    onSelect({
      _id:              String(r.id),
      id:               r.id,
      name:             r.name,
      lab:              r.lab,
      description:      r.description,
      category:         r.categoria_nombre,
      categoria_nombre: r.categoria_nombre,
      estrategiaUsada:  'busqueda_avanzada',
    });
  };

  const setPend = (key: keyof FiltrosState, val: string) =>
    setPendientes((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="filtros-wrapper">

      {/* Botón toggle */}
      <button
        className={`filtros-toggle ${abierto ? 'activo' : ''}`}
        onClick={() => setAbierto((v) => !v)}
      >
        <span>🔧</span>
        <span>Filtros avanzados</span>
        {filtrosActivos > 0 && (
          <span className="filtros-badge">{filtrosActivos}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
          {abierto ? '▲' : '▼'}
        </span>
      </button>

      {/* Panel de filtros */}
      {abierto && (
        <div className="filtros-panel">
          <div className="filtros-grid">

            <div className="filtro-grupo">
              <label>Categoría</label>
              <select value={pendientes.categoria} onChange={(e) => setPend('categoria', e.target.value)}>
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre} ({c.total_medicamentos})
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Laboratorio</label>
              <select value={pendientes.lab} onChange={(e) => setPend('lab', e.target.value)}>
                <option value="">Todos</option>
                {laboratorios.map((l) => (
                  <option key={l.lab} value={l.lab}>{l.lab}</option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Precio mínimo</label>
              <input
                type="number" placeholder="Ej: 2000" min={0}
                value={pendientes.precioMin}
                onChange={(e) => setPend('precioMin', e.target.value)}
              />
            </div>

            <div className="filtro-grupo">
              <label>Precio máximo</label>
              <input
                type="number" placeholder="Ej: 15000" min={0}
                value={pendientes.precioMax}
                onChange={(e) => setPend('precioMax', e.target.value)}
              />
            </div>

          </div>

          <div className="filtros-fila">
            <div className="filtro-grupo">
              <label>Disponibilidad</label>
              <select value={pendientes.disponible} onChange={(e) => setPend('disponible', e.target.value)}>
                <option value="">Todos</option>
                <option value="true">Con precio registrado</option>
                <option value="false">Sin precio registrado</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Ordenar por</label>
              <select value={pendientes.orden} onChange={(e) => setPend('orden', e.target.value)}>
                <option value="relevancia">Relevancia</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
          </div>

          <div className="filtros-acciones">
            <button className="btn-limpiar-filtros" onClick={handleLimpiar}>Limpiar</button>
            <button className="btn-aplicar-filtros" onClick={handleAplicar}>Buscar</button>
          </div>
        </div>
      )}

      {/* Resultados */}
      {buscado && (
        <div className="busqueda-resultados">
          {cargando ? (
            <div className="busqueda-cargando">Buscando medicamentos...</div>
          ) : resultados.length === 0 ? (
            <div className="busqueda-vacio">
              <p>😔 Sin resultados para los filtros aplicados.</p>
              <p>Intenta cambiar los filtros o el texto de búsqueda.</p>
            </div>
          ) : (
            <>
              <div className="busqueda-resultados-header">
                <span>
                  <strong>{total}</strong> medicamento{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                  {queryRef.current && <> para <strong>"{queryRef.current}"</strong></>}
                </span>
                <span>Página {page} de {totalPaginas}</span>
              </div>

              {resultados.map((r) => (
                <div key={r.id} className="resultado-card" onClick={() => handleSeleccionar(r)}>
                  <div className="resultado-info">
                    <div className="resultado-nombre">{r.name}</div>
                    <div className="resultado-meta">
                      <span>{r.lab}</span>
                      {r.categoria_nombre && (
                        <span className="resultado-categoria">{r.categoria_nombre}</span>
                      )}
                      {r.farmacias_count > 0 && (
                        <span className="resultado-farmacias">
                          {r.farmacias_count} farmacia{r.farmacias_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="resultado-precio">
                    {r.precio_minimo ? (
                      <>
                        <div className="resultado-precio-valor">
                          ${r.precio_minimo.toLocaleString('es-CO')}
                        </div>
                        <div className="resultado-precio-label">mejor precio</div>
                      </>
                    ) : (
                      <div className="resultado-sin-precio">Sin precio</div>
                    )}
                  </div>
                </div>
              ))}

              {totalPaginas > 1 && (
                <div className="busqueda-paginacion">
                  <button onClick={() => handlePagina(page - 1)} disabled={page <= 1}>← Anterior</button>
                  {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={p === page ? 'activa' : ''} onClick={() => handlePagina(p)}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => handlePagina(page + 1)} disabled={page >= totalPaginas}>Siguiente →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
