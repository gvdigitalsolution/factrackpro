import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, File } from 'lucide-react';

interface Document {
  id: number;
  client_id: number;
  client_name: string;
  type: 'invoice' | 'quote';
  number: string;
  date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  total: number;
}

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/documents', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching documents:', err);
        setLoading(false);
      });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#00C49A'; // success
      case 'sent': return '#0057B8'; // primary
      case 'overdue': return '#ef4444'; // danger
      default: return '#6b7280'; // gray/draft
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'sent': return 'Envoyée';
      case 'overdue': return 'En retard';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  return (
    <div id="documents-view" className="view">
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Documents Commerciaux</h4>
                <div className="docs-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/documents/new')}>
                        <Plus size={16} /> Nouvelle facture
                    </button>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/documents/new')}>
                        <Plus size={16} /> Nouveau devis
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '0.75rem' }}>Type</th>
                                <th style={{ padding: '0.75rem' }}>N°</th>
                                <th style={{ padding: '0.75rem' }}>Client</th>
                                <th style={{ padding: '0.75rem' }}>Date</th>
                                <th style={{ padding: '0.75rem' }}>Statut</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                                <th style={{ padding: '0.75rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center' }}>Chargement...</td></tr>
                            ) : documents.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Aucun document trouvé. Créez votre première facture !</td></tr>
                            ) : (
                                documents.map(doc => (
                                    <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            {doc.type === 'invoice' ? 
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0057B8' }}><FileText size={16}/> Facture</span> : 
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666' }}><File size={16}/> Devis</span>
                                            }
                                        </td>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{doc.number}</td>
                                        <td style={{ padding: '0.75rem' }}>{doc.client_name}</td>
                                        <td style={{ padding: '0.75rem' }}>{new Date(doc.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{ 
                                                backgroundColor: getStatusColor(doc.status) + '20', 
                                                color: getStatusColor(doc.status),
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}>
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>€{Number(doc.total).toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <button className="btn btn-outline btn-sm">Voir</button>
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

export default Documents;
