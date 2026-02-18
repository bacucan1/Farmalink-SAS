import { useState, useEffect } from 'react'
import './App.css'

interface Farmacia {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

interface Medicamento {
  _id: string;
  name: string;
  lab: string;
  active: boolean;
  description?: string;
  category?: string;
  farmaciaId: Farmacia;
}

interface Precio {
  _id: string;
  precio: number;
  medicamentoId: Medicamento;
  farmaciaId: Farmacia;
  fecha: string;
}

interface DashboardData {
  farmacias: Farmacia[];
  medicamentos: Medicamento[];
  precios: Precio[];
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Error fetching data');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Farmalink S.A.S</h1>
      
      <section className="section">
        <h2>Farmacias ({data?.farmacias.length || 0})</h2>
        <div className="grid">
          {data?.farmacias.map(farmacia => (
            <div key={farmacia._id} className="card">
              <h3>{farmacia.name}</h3>
              <p>Dirección: {farmacia.address}</p>
              <p>Teléfono: {farmacia.phone}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Medicamentos ({data?.medicamentos.length || 0})</h2>
        <div className="grid">
          {data?.medicamentos.map(med => (
            <div key={med._id} className="card">
              <h3>{med.name}</h3>
          <p>Laboratorio: {med.lab}</p>
          <p>Categoría: {med.category || 'N/A'}</p>
          <p>Estado: {med.active ? 'Activo' : 'Inactivo'}</p>
          <p>Farmacia: {med.farmaciaId?.name || 'N/A'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Precios ({data?.precios.length || 0})</h2>
        <div className="grid">
          {data?.precios.map(precio => (
            <div key={precio._id} className="card">
              <h3>{precio.medicamentoId?.name || 'N/A'}</h3>
          <p>Precio: ${precio.precio}</p>
          <p>Farmacia: {precio.farmaciaId?.name || 'N/A'}</p>
          <p>Fecha: {new Date(precio.fecha).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
