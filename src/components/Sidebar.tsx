import React from 'react';
import { LayoutDashboard, Users, FileText, CreditCard, Package, Calculator, FileSpreadsheet, Settings, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <h2>FactTrack Pro</h2>
        <small style={{ opacity: 0.8 }}>version 20251121001</small>
      </div>
      <div className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} style={{ marginRight: '0.75rem' }} /> Tableau de bord
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} style={{ marginRight: '0.75rem' }} /> Clients
        </NavLink>
        <NavLink to="/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} style={{ marginRight: '0.75rem' }} /> Documents
        </NavLink>
        <NavLink to="/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} style={{ marginRight: '0.75rem' }} /> Paiements
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} style={{ marginRight: '0.75rem' }} /> Produits
        </NavLink>
        <NavLink to="/accounting" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calculator size={20} style={{ marginRight: '0.75rem' }} /> Comptabilité
        </NavLink>
        <NavLink to="/intervat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileSpreadsheet size={20} style={{ marginRight: '0.75rem' }} /> INTERVAT
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} style={{ marginRight: '0.75rem' }} /> Paramètres
        </NavLink>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
          <button 
            onClick={handleLogout} 
            className="nav-item" 
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          >
            <LogOut size={20} style={{ marginRight: '0.75rem' }} /> Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
