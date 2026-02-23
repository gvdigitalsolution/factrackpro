import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tableau de bord';
      case '/clients': return 'Clients';
      case '/documents': return 'Documents';
      case '/payments': return 'Paiements';
      case '/products': return 'Produits';
      case '/accounting': return 'Comptabilité';
      case '/intervat': return 'INTERVAT';
      case '/settings': return 'Paramètres';
      default: return 'FactTrack Pro';
    }
  };

  return (
    <div className="app-container">
      <div style={{ display: isSidebarOpen ? 'block' : 'none' }}>
        <Sidebar />
      </div>
      <main className="main-content" style={{ marginLeft: isSidebarOpen ? '250px' : '0', width: '100%' }}>
        <TopBar title={getTitle()} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="content-area" style={{ padding: '1.5rem' }}>
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
