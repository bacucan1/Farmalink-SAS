import { useState, useEffect, useRef, useCallback } from 'react';
import './SearchAutocomplete.css';

interface Sugerencia {
  _id: string;
  name: string;
  lab: string;
  category?: string;
  description?: string;
  estrategiaUsada: string;
}

interface SearchAutocompleteProps {
  /** Callback cuando el usuario selecciona una sugerencia */
  onSelect?: (sugerencia: Sugerencia) => void;
  placeholder?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export function SearchAutocomplete({
  onSelect,
  placeholder = 'Buscar medicamento...',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Sugerencia | null>(null);
  const [estrategia, setEstrategia] = useState('');
  const [indiceActivo, setIndiceActivo] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Función de búsqueda con debounce de 300ms ─────────────────────────────
  const buscar = useCallback((texto: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // No llamar si < 2 caracteres
    if (texto.trim().length < 2) {
      setSugerencias([]);
      setAbierto(false);
      setCargando(false);
      return;
    }

    setCargando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/sugerencias?q=${encodeURIComponent(texto)}`
        );
        const data = await res.json();
        if (data.success) {
          setSugerencias(data.sugerencias);
          setEstrategia(data.estrategiaUsada ?? '');
          setAbierto(true); // abrir siempre para mostrar 'sin coincidencias'
        }
      } catch {
        setSugerencias([]);
        setAbierto(false);
      } finally {
        setCargando(false);
      }
    }, 300); // ← debounce 300ms
  }, []);

  useEffect(() => {
    buscar(query);
    setIndiceActivo(-1);
  }, [query, buscar]);

  // ── Cerrar dropdown al hacer click fuera ─────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSeleccionar = (s: Sugerencia) => {
    setQuery(s.name);
    setSeleccionado(s);
    setSugerencias([]);
    setAbierto(false);
    onSelect?.(s);
  };

  // ── Navegación con teclado ────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!abierto) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceActivo((i) => Math.min(i + 1, sugerencias.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && indiceActivo >= 0) {
      e.preventDefault();
      handleSeleccionar(sugerencias[indiceActivo]);
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  };

  const limpiar = () => {
    setQuery('');
    setSeleccionado(null);
    setSugerencias([]);
    setAbierto(false);
    inputRef.current?.focus();
  };

  const etiquetaEstrategia: Record<string, string> = {
    coincidencia_parcial: 'Nombre',
    por_categoria: '📂 Categoría',
    similitud_basica: '🔎 Similar',
  };

  return (
    <div className="search-wrapper" ref={dropdownRef}>
      <div className="search-input-row">
        <div className="search-input-container">
          
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => sugerencias.length > 0 && setAbierto(true)}
            autoComplete="off"
          />
          {cargando && <span className="search-spinner" />}
          {query && !cargando && (
            <button className="search-clear" onClick={limpiar} title="Limpiar">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Hint de mínimo 2 caracteres */}
      {query.length === 1 && (
        <p className="search-hint">Escribe al menos 2 caracteres para buscar</p>
      )}

      {/* Dropdown de sugerencias */}
      {abierto && query.length >= 2 && !cargando && (
        <div className="search-dropdown">
          <div className="search-dropdown-header">
            <span>Sugerencias</span>
            {estrategia && (
              <span className="search-estrategia-badge">
                {etiquetaEstrategia[estrategia] ?? estrategia}
              </span>
            )}
          </div>
          {sugerencias.length === 0 ? (
            <div className="search-no-results">
              Sin coincidencias exactas para <strong>"{query}"</strong>
            </div>
          ) : (
          <ul className="search-list">
            {sugerencias.map((s, i) => (
              <li
                key={s._id}
                className={`search-item ${i === indiceActivo ? 'search-item--active' : ''}`}
                onMouseDown={() => handleSeleccionar(s)}
                onMouseEnter={() => setIndiceActivo(i)}
              >
                <div className="search-item-name">{s.name}</div>
                <div className="search-item-meta">
                  <span>{s.lab}</span>
                  {s.category && (
                    <span className="search-item-category">{s.category}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          )}
        </div>
      )}

      {/* Tarjeta del medicamento seleccionado */}
      {seleccionado && (
        <div className="search-selected">
          <h3>✅ {seleccionado.name}</h3>
          <p>Laboratorio: <strong>{seleccionado.lab}</strong></p>
          {seleccionado.category && (
            <p>Categoría: <strong>{seleccionado.category}</strong></p>
          )}
          {seleccionado.description && (
            <p className="search-selected-desc">{seleccionado.description}</p>
          )}
          <button className="btn-comparar" onClick={() => onSelect?.(seleccionado)}>
            Ver comparación de precios →
          </button>
        </div>
      )}
    </div>
  );
}
