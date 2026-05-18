import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import './CheckoutView.css';

interface CheckoutViewProps {
  onGoHome: () => void;
  onGoCart: () => void;
}

export function CheckoutView({ onGoHome, onGoCart }: CheckoutViewProps) {
  const { cartTotal, cartCount, clearCart } = useCart();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: 'Bogotá',
    tarjeta: '',
    vencimiento: '',
    cvv: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call for payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      clearCart();
      addToast('¡Pago procesado exitosamente!', 'success');
      
      setTimeout(() => {
        onGoHome();
      }, 3000);
    }, 2000);
  };

  if (success) {
    return (
      <div className="checkout-view container view active">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>¡Pedido Confirmado!</h2>
          <p>Tu pago ha sido procesado exitosamente y tus medicamentos están en camino.</p>
          <p className="redirect-msg">Serás redirigido al inicio en unos segundos...</p>
          <button className="btn-primary mt-4" onClick={onGoHome}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="checkout-view container view active">
        <div className="checkout-empty">
          <h2>No hay nada que pagar</h2>
          <button className="btn-primary mt-4" onClick={onGoCart}>
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-view container view active">
      <div className="checkout-header">
        <button className="back-btn" onClick={onGoCart}>← Volver al carrito</button>
        <h1 className="checkout-title">Finalizar Compra</h1>
      </div>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          
          <section className="form-section">
            <h2>Datos de Entrega</h2>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input type="text" id="nombre" name="nombre" required value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan Pérez" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input type="text" id="direccion" name="direccion" required value={formData.direccion} onChange={handleChange} placeholder="Calle 123 # 45-67" />
              </div>
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad</label>
                <select id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange}>
                  <option value="Bogotá">Bogotá</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Método de Pago (Ficticio)</h2>
            <div className="payment-cards">
              <div className="payment-card active">
                <span className="card-dot"></span> Tarjeta de Crédito
              </div>
            </div>
            
            <div className="form-group mt-3">
              <label htmlFor="tarjeta">Número de Tarjeta</label>
              <input type="text" id="tarjeta" name="tarjeta" required value={formData.tarjeta} onChange={handleChange} placeholder="0000 0000 0000 0000" maxLength={19} pattern="\d{16}|\d{4} \d{4} \d{4} \d{4}" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vencimiento">Vencimiento</label>
                <input type="text" id="vencimiento" name="vencimiento" required value={formData.vencimiento} onChange={handleChange} placeholder="MM/AA" maxLength={5} />
              </div>
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input type="text" id="cvv" name="cvv" required value={formData.cvv} onChange={handleChange} placeholder="123" maxLength={4} />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            className="btn-primary pay-btn" 
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : `Pagar ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(cartTotal)}`}
          </button>
        </form>

        <div className="checkout-summary">
          <div className="summary-box">
            <h2>Resumen</h2>
            <div className="summary-details">
              <span>{cartCount} artículos</span>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span className="free-shipping">Gratis</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total a Pagar</span>
              <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(cartTotal)}</span>
            </div>
            <div className="secure-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Pago 100% Seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
