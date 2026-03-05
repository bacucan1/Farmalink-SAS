import type { View } from '../../types';
import logoFarmalink from '../../assets/logo-farmalink.png';
import './Header.css';

/**
 * Props para el componente Header
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Vista actual de la aplicación */
  currentView: View;
  /** Callback para cambiar de vista */
  onViewChange: (view: View) => void;
  /** Indica si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Rol del usuario autenticado */
  userRole: string;
  /** Callback para cerrar sesión */
  onLogout: () => void;
}

/**
 * Header navegación principal de FarmaLink
 * @component
 * @description Barra de navegación responsive con logo, links y call-to-action
 * @param {HeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} Header navegable
 */
export function Header({ currentView, onViewChange, isAuthenticated, userRole, onLogout }: HeaderProps) {
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
              <a 
                onClick={() => onViewChange('home')} 
                className={currentView === 'home' ? 'active' : ''}
              >
                Inicio
              </a>
            </li>
            <li>
              <a 
                onClick={() => onViewChange('buscar')} 
                className={currentView === 'buscar' ? 'active' : ''}
              >
                Buscar
              </a>
            </li>
            <li>
              <a 
                onClick={() => onViewChange('dashboard')} 
                className={currentView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </li>
            {userRole === 'admin' && (
              <li>
                <a 
                  onClick={() => onViewChange('admin')} 
                  className={currentView === 'admin' ? 'active' : ''}
                >
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
                <a 
                  className="nav-cta" 
                  onClick={() => onViewChange('login')}
                >
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
