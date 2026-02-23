import { Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  toggleSidebar: () => void;
}

const TopBar = ({ title, toggleSidebar }: TopBarProps) => {
  return (
    <div className="top-bar">
      <button className="menu-toggle" id="menuToggle" onClick={toggleSidebar} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', marginRight: '1rem' }}>
        <Menu />
      </button>
      <h3 id="pageTitle" style={{ margin: 0, flex: 1 }}>{title}</h3>
      <div>
        <button className="btn btn-outline btn-sm" id="exportBtn">Exporter</button>
        <button className="btn btn-outline btn-sm" id="importBtn" style={{ marginLeft: '0.5rem' }}>Importer</button>
        <button className="btn btn-outline btn-sm" onClick={() => window.print()} style={{ marginLeft: '0.5rem' }}>Imprimer</button>
      </div>
    </div>
  );
};

export default TopBar;
