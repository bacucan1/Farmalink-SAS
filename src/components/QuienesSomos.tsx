// @ts-ignore
import './QuienesSomos.css';

export function QuienesSomos() {
  return (
    <div className="quienes-somos-container">
      {/* Header Section */}
      <div className="quienes-somos-header">
        <div className="container">
          <h1 className="quienes-somos-title">Quiénes Somos</h1>
          <p className="quienes-somos-subtitle">
            Transformando el acceso a información farmacéutica en Colombia
          </p>
        </div>
      </div>

      <div className="container">
        {/* Misión */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Misión</h2>
            <div className="section-divider"></div>
          </div>
          <p className="section-text">
            Democratizar el acceso a información farmacéutica transparente en Colombia, proporcionando a los ciudadanos una plataforma digital inteligente que centraliza precios de medicamentos entre farmacias cercanas, elimina la asimetría de información y permite tomar decisiones de compra informadas en tiempo real, reduciendo el sobregasto evitable en salud.
          </p>
        </section>

        {/* Visión */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Visión</h2>
            <div className="section-divider"></div>
          </div>
          <p className="section-text">
            Dentro de algunos años, ser la plataforma de referencia en transparencia farmacéutica de América Latina, conectando a millones de usuarios con información de precios y disponibilidad de medicamentos en tiempo real, posicionando a FarmaLink como el estándar tecnológico que garantiza equidad en el acceso a la salud.
          </p>
        </section>

        {/* Estrategia */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Estrategia</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="subsection">
            <h3 className="subsection-title">Objetivos Estratégicos</h3>
            <ul className="strategy-list">
              <li>Centralizar y actualizar en tiempo real los precios de medicamentos de farmacias en las principales ciudades de Colombia.</li>
              <li>Reducir en al menos un 30% el sobregasto promedio de los usuarios mediante comparación inteligente de precios.</li>
              <li>Garantizar una experiencia accesible bajo estándares WCAG 2.1 para usuarios con diferentes niveles de alfabetización digital.</li>
              <li>Escalar la arquitectura hacia microservicios con Kubernetes para soportar crecimiento nacional.</li>
              <li>Integrar recomendaciones inteligentes basadas en historial de búsqueda, geolocalización y disponibilidad.</li>
              <li>Establecer alianzas con cadenas farmacéuticas para obtener datos verificados y actualizados automáticamente.</li>
            </ul>
          </div>
        </section>

        {/* Cultura */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Cultura</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="subsection">
            <h3 className="subsection-title">Valores Corporativos</h3>
            
            <div className="values-grid">
              <div className="value-card">
                <h4 className="value-title">Transparencia</h4>
                <p className="value-description">
                  Información farmacéutica clara, verificada y accesible para todos los ciudadanos, sin barreras ni sesgos comerciales.
                </p>
              </div>
              
              <div className="value-card">
                <h4 className="value-title">Equidad en Salud</h4>
                <p className="value-description">
                  Compromiso con reducir la desigualdad en el acceso a medicamentos, especialmente para poblaciones de menores ingresos.
                </p>
              </div>
              
              <div className="value-card">
                <h4 className="value-title">Innovación Tecnológica</h4>
                <p className="value-description">
                  Uso de arquitecturas modernas, patrones de diseño y tecnologías escalables orientadas al crecimiento continuo.
                </p>
              </div>
              
              <div className="value-card">
                <h4 className="value-title">Seguridad y Confianza</h4>
                <p className="value-description">
                  Protección de datos mediante autenticación JWT, cifrado y cumplimiento de estándares de seguridad informática.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mercado */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Mercado</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="subsection">
            <h3 className="subsection-title">Propuesta de Valor</h3>
            <p className="section-text">
              FarmaLink resuelve un problema crítico del mercado farmacéutico colombiano: la variación de precios de un mismo medicamento puede superar el 400% entre establecimientos, mientras que la mayoría de los ciudadanos desconoce estas diferencias. La plataforma permite comparar precios y disponibilidad en tiempo real, ayudando a reducir el sobregasto en salud.
            </p>
            
            <div className="market-stats">
              <div className="stat-item">
                <span className="stat-number">+400%</span>
                <span className="stat-label">de variación de precio entre farmacias</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">78%</span>
                <span className="stat-label">de colombianos sin información clara sobre precios</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">$400B+</span>
                <span className="stat-label">en sobregasto anual estimado</span>
              </div>
            </div>
          </div>
          
          <div className="subsection">
            <h3 className="subsection-title">Segmento de Clientes</h3>
            
            <div className="segments-grid">
              <div className="segment-card">
                <h4 className="segment-title">Consumidor Final</h4>
                <p className="segment-description">
                  Ciudadanos colombianos que buscan medicamentos al mejor precio sin desplazamientos innecesarios.
                </p>
              </div>
              
              <div className="segment-card">
                <h4 className="segment-title">Gestores de Farmacia</h4>
                <p className="segment-description">
                  Administradores de farmacias interesados en visibilidad digital y análisis del mercado.
                </p>
              </div>
              
              <div className="segment-card">
                <h4 className="segment-title">Pacientes con Enfermedades Crónicas</h4>
                <p className="segment-description">
                  Usuarios con compras recurrentes que requieren optimización constante de costos.
                </p>
              </div>
              
              <div className="segment-card">
                <h4 className="segment-title">Entidades de Salud</h4>
                <p className="segment-description">
                  EPS, IPS y organismos gubernamentales interesados en monitoreo y transparencia de precios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Empresa */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Empresa</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="subsection">
            <h3 className="subsection-title">Estructura Organizacional</h3>
            <p className="section-text">
              FarmaLink SAS es una empresa tecnológica constituida en Colombia, con operación inicial en Bogotá D.C. El equipo fundador está integrado por ingenieros de sistemas especializados en desarrollo web moderno y arquitecturas escalables.
            </p>
            
            <div className="team-grid">
              <div className="team-member">
                <h4 className="team-name">Andrés Camilo Barco Roa</h4>
                <span className="team-role">Desarrollo e integración</span>
              </div>
              
              <div className="team-member">
                <h4 className="team-name">Haiver Darío Daza Cerdas</h4>
                <span className="team-role">Backend y base de datos</span>
              </div>
              
              <div className="team-member">
                <h4 className="team-name">Sergio Andrés Merchán Rozo</h4>
                <span className="team-role">Frontend y experiencia de usuario</span>
              </div>
              
              <div className="team-member">
                <h4 className="team-name">Eduar Fabián Ultengo Pedraza</h4>
                <span className="team-role">Arquitectura y DevOps</span>
              </div>
              
              <div className="team-member">
                <h4 className="team-name">Daniel Leonardo González Torres</h4>
                <span className="team-role">Seguridad y calidad</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tecnología */}
        <section className="quienes-somos-section">
          <div className="section-header">
            <h2 className="qs-section-title">Tecnología</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="subsection">
            <h3 className="subsection-title">Stack Tecnológico</h3>
            <p className="section-text">
              La plataforma utiliza un ecosistema moderno, modular y orientado a microservicios:
            </p>
            
            <div className="tech-grid">
              <div className="tech-item">
                <span className="tech-icon">⚛️</span>
                <span className="tech-name">React 19 + TypeScript</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">🟢</span>
                <span className="tech-name">Node.js + Express 5</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">🐘</span>
                <span className="tech-name">PostgreSQL 16</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">🔐</span>
                <span className="tech-name">JWT Authentication</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">🚪</span>
                <span className="tech-name">API Gateway</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">🐳</span>
                <span className="tech-name">Docker + Docker Compose</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">⚡</span>
                <span className="tech-name">Vite 7</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-icon">☁️</span>
                <span className="tech-name">Neon Serverless Database</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
