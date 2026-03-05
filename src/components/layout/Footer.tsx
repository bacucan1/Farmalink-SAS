import logoFarmalink from '../../assets/logo-farmalink.png';
import './Footer.css';

/**
 * Props para el componente Footer
 * @interface FooterProps
 */
interface FooterProps {
  /** Callback para navegar a otras vistas */
  onNavigate?: (view: string) => void;
}

/**
 * Footer de FarmaLink
 * @component
 * @description Pie de página con información de la plataforma, navegación y credits
 * @param {FooterProps} props - Propiedades del componente
 * @returns {JSX.Element} Footer de la aplicación
 */
export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <a className="footer-logo" href="#">
              <img src={logoFarmalink} alt="FarmaLink" className="footer-logo-img" />
            </a>
            <p className="footer-desc">
              Plataforma inteligente que facilita el acceso a medicamentos mediante 
              comparación de precios en tiempo real y recomendaciones personalizadas.
            </p>
            <div className="footer-tagline">Encuentra. Compara. Ahorra.</div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Navegación</h4>
            <ul className="footer-links">
              <li><a onClick={() => onNavigate?.('home')}>Inicio</a></li>
              <li><a onClick={() => onNavigate?.('buscar')}>Buscar Medicamento</a></li>
              <li><a onClick={() => onNavigate?.('dashboard')}>Dashboard</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Stack Tecnológico</h4>
            <ul className="footer-links">
              <li><span>React + TypeScript</span></li>
              <li><span>Node.js + Express</span></li>
              <li><span>MongoDB + Mongoose</span></li>
              <li><span>Docker + Ngrok</span></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <span className="footer-copy">© 2025 FarmaLink Solutions. Proyecto académico.</span>
          <span className="footer-made">Hecho con dedicación por el equipo FarmaLink</span>
        </div>
      </div>
    </footer>
  );
}
