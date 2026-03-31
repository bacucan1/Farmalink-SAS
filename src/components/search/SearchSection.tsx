import { useState, useRef } from 'react';
import { FiltrosBusqueda } from './FiltrosBusqueda';
import type { Sugerencia } from '../../types';
import { useToast } from '../../hooks/useToast';
import './SearchSection.css';

interface SearchSectionProps {
  onSelect?: (medicamento: Sugerencia) => void;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

export function SearchSection({ onSelect, isAuthenticated = false, onLoginRequired }: SearchSectionProps) {
  const [inputValue, setInputValue]     = useState('');
  const [queryActivo, setQueryActivo]   = useState('');

  const inputRef    = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (!val.trim()) setQueryActivo('');
  };

  const handleBuscar = () => {
    if (!isAuthenticated) {
      addToast('Necesitas iniciar sesión para buscar y comparar precios.', 'warning');
      onLoginRequired?.();
      return;
    }
    if (inputValue.trim().length < 2) {
      addToast('Escribe al menos 2 caracteres para buscar.', 'warning');
      inputRef.current?.focus();
      return;
    }
    const q = inputValue.trim();
    setQueryActivo(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  const handleLimpiar = () => {
    setInputValue(''); setQueryActivo('');
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

          {!isAuthenticated ? (
            <div className="search-restricted-card" role="region" aria-label="Acceso restringido">
              <div className="search-restricted-icon" aria-hidden="true">
                <span className="search-restricted-icon-lock">🔒</span>
              </div>
              <div className="search-restricted-title">Acceso restringido</div>
              <div className="search-restricted-desc">
                Necesitas iniciar sesión para acceder a <strong>Búsqueda</strong>.
              </div>
              <div className="search-restricted-actions">
                <button
                  className="search-restricted-btn-login"
                  onClick={() => onLoginRequired?.()}
                  type="button"
                >
                  Iniciar Sesión
                </button>
                <button
                  className="search-restricted-btn-home"
                  onClick={() => window.location.assign('/')}
                  type="button"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="search-bar-wrapper">
                <div className="search-bar-input-wrap" style={{ position: 'relative' }}>
                  <span className="search-bar-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="search-bar-input"
                    placeholder="Ej: Acetaminofén, Ibuprofeno, Bayer..."
                    value={inputValue}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Buscar medicamento"
                  />
                  {inputValue && (
                    <button className="search-bar-clear" onClick={handleLimpiar} aria-label="Limpiar">✕</button>
                  )}
                </div>

                <button className="search-bar-btn" onClick={handleBuscar} aria-label="Buscar medicamento">
                  Buscar
                </button>
              </div>

              <FiltrosBusqueda
                query={queryActivo}
                onSelect={med => {
                  onSelect?.(med);
                }}
              />
            </>
          )}
        </div>
      </div>

    </div>
  );
}
