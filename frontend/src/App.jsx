import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage.jsx';
import PlantList from './components/PlantList.jsx';
import PlantForm from './components/PlantForm.jsx';
import PlantDetail from './components/PlantDetail.jsx';
import { setToken, getToken } from './services/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [view, setView] = useState('list');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [token]);

  function handleLogin(userData, userToken) {
    setUser(userData);
    setTokenState(userToken);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setView('list');
  }

  function handleLogout() {
    setUser(null);
    setTokenState(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setView('list');
  }

  function handlePlantCreated() {
    setRefreshKey(k => k + 1);
    setView('list');
  }

  function handleSelectPlant(plant) {
    setSelectedPlant(plant);
    setView('detail');
  }

  function handleBack() {
    setSelectedPlant(null);
    setRefreshKey(k => k + 1);
    setView('list');
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌱 Plant Journal</h1>
        <p>Oi, {user.name}!</p>
        <button className="logout-btn" onClick={handleLogout}>Sair</button>
      </header>

      <nav className="app-nav">
        <button
          className={view === 'list' ? 'active' : ''}
          onClick={() => setView('list')}
        >
          Plantas
        </button>
        <button
          className={view === 'form' ? 'active' : ''}
          onClick={() => setView('form')}
        >
          + Nova Planta
        </button>
      </nav>

      <main className="app-main">
        {view === 'list' && (
          <PlantList key={refreshKey} onSelectPlant={handleSelectPlant} />
        )}
        {view === 'form' && (
          <PlantForm onPlantCreated={handlePlantCreated} />
        )}
        {view === 'detail' && selectedPlant && (
          <PlantDetail plant={selectedPlant} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}
