import { useState, useRef, useEffect, useCallback } from 'react';
import { FiltrosBusqueda } from './FiltrosBusqueda';
import type { Sugerencia } from '../../types';
import { useToast } from '../../hooks/useToast';
import './SearchSection.css';

interface SearchSectionProps {
  onSelect?: (medicamento: Sugerencia) => void;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export function SearchSection({ onSelect, isAuthenticated = false, onLoginRequired }: SearchSectionProps) {
  const [inputValue, setInputValue]     = useState('');
  const [queryActivo, setQueryActivo]   = useState('');
  const [sugerencias, setSugerencias]   = useState<Sugerencia[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cargando, setCargando]         = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buscarSugerencias = useCallback((texto: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (texto.trim().length < 2) {
      setSugerencias([]);
      setDropdownOpen(false);
      return;
    }
    setCargando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sugerencias?q=${encodeURIComponent(texto)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.success) {
          setSugerencias(data.sugerencias || []);
          setDropdownOpen((data.sugerencias || []).length > 0);
        }
      } catch {
        setSugerencias([]);
      } finally {
        setCargando(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setIndiceActivo(-1);
    buscarSugerencias(val);
    if (!val.trim()) { setQueryActivo(''); setSugerencias([]); setDropdownOpen(false); }
  };

  const handleSelect = (med: Sugerencia) => {
    setDropdownOpen(false);
    setSugerencias([]);
    setInputValue(med.name);
    if (!isAuthenticated) { onLoginRequired?.(); return; }
    onSelect?.(med);
  };

  const handleBuscar = () => {
    setDropdownOpen(false);
    if (inputValue.trim().length < 2) {
      addToast('Escribe al menos 2 caracteres para buscar.', 'warning');
      inputRef.current?.focus();
      return;
    }
    setQueryActivo(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (indiceActivo >= 0 && sugerencias[indiceActivo]) handleSelect(sugerencias[indiceActivo]);
      else handleBuscar();
    } else if (e.key === 'ArrowDown') { e.preventDefault(); setIndiceActivo(i => Math.min(i + 1, sugerencias.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndiceActivo(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Escape') setDropdownOpen(false);
  };

  const handleLimpiar = () => {
    setInputValue(''); setQueryActivo(''); setSugerencias([]); setDropdownOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="view active search-section">
      <div className="search-hero">
        <div className="container">
          <div className="section-tag">Búsqueda inteligente</div>
          <h1 className="section-title">¿Qué medicamento<br />estás buscando?</h1>
          <p className="section-desc">
            Escribe el nombre del medicamento y presiona Buscar.
            Puedes filtrar por categoría, laboratorio y rango de precios.
          </p>

          {!isAuthenticated && (
            <div className="search-login-notice">
              Inicia sesión para ver el detalle y comparar precios
            </div>
          )}

          <div className="search-bar-wrapper" ref={wrapperRef}>
            <div className="search-bar-input-wrap" style={{ position: 'relative' }}>
              <span className="search-bar-icon" aria-hidden="true">
                {cargando ? (
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                )}
              </span>
              <input
                ref={inputRef}
                type="text"
                className="search-bar-input"
                placeholder="Ej: Acetaminofén, Ibuprofeno, Bayer..."
                value={inputValue}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => sugerencias.length > 0 && setDropdownOpen(true)}
                autoComplete="off"
                spellCheck={false}
                aria-label="Buscar medicamento"
              />
              {inputValue && (
                <button className="search-bar-clear" onClick={handleLimpiar} aria-label="Limpiar">✕</button>
              )}

              {dropdownOpen && sugerencias.length > 0 && (
                <div className="search-autocomplete-dropdown">
                  <div className="search-autocomplete-header">Sugerencias</div>
                  <ul>
                    {sugerencias.map((s, i) => (
                      <li
                        key={s._id}
                        className={`search-autocomplete-item ${i === indiceActivo ? 'active' : ''}`}
                        onMouseDown={() => handleSelect(s)}
                        onMouseEnter={() => setIndiceActivo(i)}
                      >
                        <div className="search-autocomplete-name">{s.name}</div>
                        <div className="search-autocomplete-meta">
                          <span>{s.lab}</span>
                          {(s.category || s.categoria_nombre) && (
                            <span className="search-autocomplete-cat">{s.category || s.categoria_nombre}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="search-autocomplete-hint">↑↓ navegar · Enter seleccionar · Esc cerrar</div>
                </div>
              )}
            </div>

            <button className="search-bar-btn" onClick={handleBuscar} aria-label="Buscar medicamento">
              Buscar
            </button>
          </div>

          <FiltrosBusqueda
            query={queryActivo}
            onSelect={med => {
              if (!isAuthenticated) { onLoginRequired?.(); return; }
              onSelect?.(med);
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .search-autocomplete-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: white; border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12); border: 1px solid #e8e8f0;
          z-index: 200; overflow: hidden; animation: fadeInDown 0.15s ease;
        }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .search-autocomplete-header { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #999; font-weight: 600; padding: 0.6rem 1rem 0.4rem; border-bottom: 1px solid #f0f0f0; }
        .search-autocomplete-dropdown ul { list-style: none; margin: 0; padding: 0.3rem 0; max-height: 280px; overflow-y: auto; }
        .search-autocomplete-item { padding: 0.6rem 1rem; cursor: pointer; transition: background 0.15s; }
        .search-autocomplete-item:hover, .search-autocomplete-item.active { background: #f4f4ff; }
        .search-autocomplete-name { font-weight: 600; font-size: 0.9rem; color: #1a1a2e; }
        .search-autocomplete-meta { display: flex; gap: 0.5rem; font-size: 0.78rem; color: #888; margin-top: 0.15rem; }
        .search-autocomplete-cat { background: #e0e7ff; color: #4338ca; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.72rem; font-weight: 500; }
        .search-autocomplete-hint { font-size: 0.72rem; color: #bbb; text-align: center; padding: 0.4rem; border-top: 1px solid #f0f0f0; }
      `}</style>
    </div>
  );
}
