import { useState, useEffect } from 'react'
import './App.css'
import { SearchAutocomplete } from './components/SearchAutocomplete'

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
    async function loadData() {
      try {
        // 1️. Login para obtener token
        const loginRes = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com' })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;

        localStorage.setItem("token", token);

        // 2️. Llamar dashboard usando gateway
        const res = await fetch('http://localhost:4000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Error fetching data');

        const data = await res.json();
        setData(data);
        setLoading(false);

      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Farmalink S.A.S</h1>

      {/* buscador*/}
      <section className="section">
        <h2>Buscar Medicamento</h2>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Escribe al menos 2 caracteres. El sistema selecciona la mejor estrategia de busqueda automaticamente.
        </p>
        <SearchAutocomplete
          placeholder="Ej: Acetaminofen, antibiotico, Genfar..."
          onSelect={(med) => console.log('Medicamento seleccionado:', med)}
        />
      </section>

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
