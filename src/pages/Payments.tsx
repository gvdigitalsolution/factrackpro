import { useEffect, useState } from 'react';
import { Plus, CreditCard, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: number;
  document_id: number;
  document_number: string;
  client_name: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
}

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/payments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching payments:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="view">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4>Historique des Paiements</h4>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/payments/new')}>
            <Plus size={16} /> Enregistrer un paiement
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Facture Concernée</th>
                  <th style={{ padding: '0.75rem' }}>Client</th>
                  <th style={{ padding: '0.75rem' }}>Méthode</th>
                  <th style={{ padding: '0.75rem' }}>Référence</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>Chargement...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Aucun paiement enregistré.</td></tr>
                ) : (
                  payments.map(payment => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} color="#666"/> {new Date(payment.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>{payment.document_number || '-'}</td>
                      <td style={{ padding: '0.75rem' }}>{payment.client_name || '-'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CreditCard size={14} color="#666"/> {payment.method}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.9em' }}>{payment.reference}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#00C49A' }}>
                        +€{Number(payment.amount).toFixed(2)}
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

export default Payments;
