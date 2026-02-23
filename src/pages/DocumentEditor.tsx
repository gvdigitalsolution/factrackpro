import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, Save, ArrowLeft } from 'lucide-react';

interface Client {
  id: number;
  name: string;
}

interface DocumentItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const DocumentEditor = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  
  const [type, setType] = useState<'invoice' | 'quote'>('invoice');
  const [clientId, setClientId] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [number, setNumber] = useState('FACT-' + Date.now().toString().slice(-6));
  
  const [items, setItems] = useState<DocumentItem[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ]);

  useEffect(() => {
    // Fetch clients for dropdown
    fetch('http://localhost:3000/api/clients', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error(err));
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Veuillez sélectionner un client');
      return;
    }

    const payload = {
      client_id: clientId,
      type,
      number,
      date,
      due_date: dueDate || null,
      items
    };

    try {
      const res = await fetch('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/documents');
      } else {
        alert('Erreur lors de la création du document');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  };

  return (
    <div className="view">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/documents')}>
            <ArrowLeft size={16} />
          </button>
          <h4>Nouveau Document</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div className="col" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                <select 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={type}
                  onChange={(e) => setType(e.target.value as 'invoice' | 'quote')}
                >
                  <option value="invoice">Facture</option>
                  <option value="quote">Devis</option>
                </select>
              </div>
              <div className="col" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Numéro</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div className="col" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Client</label>
                <select 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  required
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="col" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="col" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Échéance</label>
                <input 
                  type="date" 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

            <div style={{ marginBottom: '1rem' }}>
              <h5>Lignes du document</h5>
              <table className="table" style={{ width: '100%', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#f8f9fa' }}>
                    <th style={{ padding: '0.5rem' }}>Description</th>
                    <th style={{ padding: '0.5rem', width: '100px' }}>Qté</th>
                    <th style={{ padding: '0.5rem', width: '150px' }}>Prix Unitaire</th>
                    <th style={{ padding: '0.5rem', width: '150px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '0.5rem', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ width: '100%', padding: '0.25rem' }}
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description du service ou produit"
                          required
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ width: '100%', padding: '0.25rem' }}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ width: '100%', padding: '0.25rem' }}
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        €{(item.quantity * item.unit_price).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItem(index)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={addItem}
                style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Ajouter une ligne
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '2rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: 0 }}>Total: €{calculateTotal().toFixed(2)}</h4>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
               <button type="button" className="btn btn-outline" onClick={() => navigate('/documents')}>Annuler</button>
               <button type="submit" className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Save size={16} /> Enregistrer
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
