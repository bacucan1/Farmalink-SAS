/**
 * SearchSection.tsx — REDISEÑO PUNTO 4
 *
 * CAMBIOS:
 * - Se elimina SearchAutocomplete (el dropdown de sugerencias al escribir)
 * - El input y el botón "Buscar" están integrados directamente aquí
 * - Al hacer clic en "Buscar" o Enter se dispara FiltrosBusqueda
 * - Se eliminó el botón "Filtros avanzados" — los filtros se muestran
 *   directamente debajo del buscador al iniciar la búsqueda
 */

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
  const [inputValue, setInputValue]   = useState('');
  const [queryActivo, setQueryActivo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleSelect = (med: Sugerencia) => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    onSelect?.(med);
  };

  const handleBuscar = () => {
    if (inputValue.trim().length < 2) {
      addToast('Escribe al menos 2 caracteres para buscar.', 'warning');
      inputRef.current?.focus();
      return;
    }
    setQueryActivo(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBuscar();
  };

  const handleLimpiarInput = () => {
    setInputValue('');
    setQueryActivo('');
    inputRef.current?.focus();
  };

  return (
    <div className="view active search-section">
      <div className="search-hero">
        <div className="container">
          <div className="section-tag">Búsqueda inteligente</div>
          <h1 className="section-title">
            ¿Qué medicamento<br />estás buscando?
          </h1>
          <p className="section-desc">
            Escribe el nombre del medicamento y presiona Buscar.
            Puedes filtrar por categoría, laboratorio y rango de precios.
          </p>

          {!isAuthenticated && (
            <div className="search-login-notice">
              Inicia sesión para ver el detalle y comparar precios
            </div>
          )}

          {/* ── Barra de búsqueda unificada ── */}
          <div className="search-bar-wrapper">
            <div className="search-bar-input-wrap">
              <span className="search-bar-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="search-bar-input"
                placeholder="Ej: Acetaminofén, Ibuprofeno, Bayer..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
                aria-label="Buscar medicamento"
              />
              {inputValue && (
                <button
                  className="search-bar-clear"
                  onClick={handleLimpiarInput}
                  aria-label="Limpiar búsqueda"
                  title="Limpiar"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              className="search-bar-btn"
              onClick={handleBuscar}
              aria-label="Buscar medicamento"
            >
              Buscar
            </button>
          </div>

          {/* FiltrosBusqueda — siempre montado, se activa cuando queryActivo cambia */}
          <FiltrosBusqueda
            query={queryActivo}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
