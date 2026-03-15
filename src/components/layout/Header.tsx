import { useState, useEffect, useRef } from 'react';
import type { View, Categoria } from '../../types';
import logoFarmalink from '../../assets/logo-farmalink.png';
import './Header.css';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isAuthenticated: boolean;
  userRole: string;
  onLogout: () => void;
  onCategorySelect: (categoria: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export function Header({ currentView, onViewChange, isAuthenticated, userRole, onLogout, onCategorySelect }: HeaderProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Cargar categorías desde la API al montar
  useEffect(() => {
    fetch(`${API_BASE}/api/categorias`)
      .then(r => r.json())
      .then(d => { if (d.success) setCategorias(d.data); })
      .catch(() => {});
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCategoryClick = (nombre: string) => {
    setDropdownOpen(false);
    onCategorySelect(nombre);
    onViewChange('categoria');
  };

  return (
    <header className="header" id="header">
      <nav className="navbar">
        <div className="container navbar-container">
          <a
            className="logo"
            href="#"
            onClick={(e) => { e.preventDefault(); onViewChange('home'); }}
          >
            <img src={logoFarmalink} alt="FarmaLink" className="logo-img" />
          </a>

          <button
            className="mobile-menu-btn"
            aria-label="Abrir menú"
            onClick={() => {
              const nav = document.querySelector('.nav-links');
              nav?.classList.toggle('mobile-open');
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className="nav-links">
            <li>
              <a onClick={() => onViewChange('home')} className={currentView === 'home' ? 'active' : ''}>
                Inicio
              </a>
            </li>
            <li>
              <a onClick={() => onViewChange('buscar')} className={currentView === 'buscar' ? 'active' : ''}>
                Buscar
              </a>
            </li>

            {/* ── Menú desplegable de Categorías ── */}
            <li
              className={`nav-dropdown-wrapper ${currentView === 'categoria' ? 'active-parent' : ''}`}
              ref={dropdownRef}
            >
              <a
                className={`nav-dropdown-trigger ${currentView === 'categoria' ? 'active' : ''}`}
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                Categorías
                <span className={`nav-dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▾</span>
              </a>

              {dropdownOpen && (
                <div className="nav-dropdown" role="menu">
                  <div className="nav-dropdown-header">Categorías de medicamentos</div>
                  <ul>
                    {categorias.length === 0 ? (
                      <li className="nav-dropdown-loading">Cargando...</li>
                    ) : (
                      categorias.map(cat => (
                        <li key={cat.id}>
                          <button
                            className="nav-dropdown-item"
                            onClick={() => handleCategoryClick(cat.nombre)}
                            role="menuitem"
                          >
                            {cat.nombre}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </li>

            <li>
              <a onClick={() => onViewChange('mapa')} className={currentView === 'mapa' ? 'active' : ''}>
                Mapa
              </a>
            </li>
            <li>
              <a onClick={() => onViewChange('dashboard')} className={currentView === 'dashboard' ? 'active' : ''}>
                Dashboard
              </a>
            </li>
            {userRole === 'admin' && (
              <li>
                <a onClick={() => onViewChange('admin')} className={currentView === 'admin' ? 'active' : ''}>
                  Admin
                </a>
              </li>
            )}
            <li className="nav-cta-item">
              {isAuthenticated ? (
                <button className="nav-logout" onClick={onLogout}>
                  Cerrar Sesión
                </button>
              ) : (
                <a className="nav-cta" onClick={() => onViewChange('login')}>
                  Iniciar Sesión
                </a>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
