import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: number;
  name: string;
  tva: string;
  email: string;
  phone: string;
  balance: number;
}

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/clients', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching clients:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        fetchClients();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  };

  return (
    <div id="clients-view" className="view">
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Gestion des Clients</h4>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => navigate('/clients/new')}
                >
                    <Plus size={16} /> Nouveau Client
                </button>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '0.75rem' }}>Nom</th>
                                <th style={{ padding: '0.75rem' }}>TVA</th>
                                <th style={{ padding: '0.75rem' }}>Email</th>
                                <th style={{ padding: '0.75rem' }}>Solde dû</th>
                                <th style={{ padding: '0.75rem', width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Chargement...</td></tr>
                            ) : clients.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Aucun client trouvé.</td></tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem' }}>{client.name}</td>
                                        <td style={{ padding: '0.75rem' }}>{client.tva}</td>
                                        <td style={{ padding: '0.75rem' }}>{client.email}</td>
                                        <td style={{ padding: '0.75rem' }}>€{Number(client.balance).toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                              className="btn btn-sm btn-outline" 
                                              title="Modifier"
                                              onClick={() => navigate(`/clients/edit/${client.id}`)}
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button 
                                              className="btn btn-sm btn-outline" 
                                              style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                                              title="Supprimer"
                                              onClick={() => handleDelete(client.id)}
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Clients;
