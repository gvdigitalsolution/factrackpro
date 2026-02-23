import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

interface Document {
  id: number;
  number: string;
  client_name: string;
  total: number;
  status: string;
}

const PaymentEditor = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [documentId, setDocumentId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Virement');
  const [reference, setReference] = useState('');

  useEffect(() => {
    // Fetch unpaid or partially paid documents
    fetch('http://localhost:3000/api/documents')
      .then(res => res.json())
      .then((data: any[]) => {
        // Filter only invoices that are not fully paid
        const unpaidInvoices = data.filter(d => d.type === 'invoice' && d.status !== 'paid');
        setDocuments(unpaidInvoices);
      })
      .catch(err => console.error(err));
  }, []);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = Number(e.target.value);
    setDocumentId(docId);
    
    // Auto-fill amount with total if selected
    const selectedDoc = documents.find(d => d.id === docId);
    if (selectedDoc) {
      setAmount(selectedDoc.total.toString());
    } else {
      setAmount('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) {
      alert('Veuillez sélectionner une facture');
      return;
    }

    const payload = {
      document_id: documentId,
      amount: Number(amount),
      date,
      method,
      reference
    };

    try {
      const res = await fetch('http://localhost:3000/api/payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/payments');
      } else {
        alert('Erreur lors de l\'enregistrement du paiement');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  };

  return (
    <div className="view">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/payments')}>
            <ArrowLeft size={16} />
          </button>
          <h4>Enregistrer un Paiement</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Facture à payer</label>
              <select 
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem' }}
                value={documentId}
                onChange={handleDocumentChange}
                required
              >
                <option value="">Sélectionner une facture...</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.number} - {doc.client_name} (Total: €{Number(doc.total).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Montant Reçu (€)</label>
              <input 
                type="number" 
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem' }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date de réception</label>
              <input 
                type="date" 
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mode de paiement</label>
              <select 
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem' }}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Virement">Virement Bancaire</option>
                <option value="Cash">Espèces</option>
                <option value="Carte">Carte Bancaire</option>
                <option value="Cheque">Chèque</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Référence / Communication</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem' }}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: Communication structurée, Nom du donneur d'ordre..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
               <button type="button" className="btn btn-outline" onClick={() => navigate('/payments')}>Annuler</button>
               <button type="submit" className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Save size={16} /> Enregistrer le paiement
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentEditor;
