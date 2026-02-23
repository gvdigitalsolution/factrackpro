import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

const ProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    category: '',
    vat_rate: '21.00',
    active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`http://localhost:3000/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Produit non trouvé');
          return res.json();
        })
        .then(data => {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price || '',
            sku: data.sku || '',
            category: data.category || '',
            vat_rate: data.vat_rate || '21.00',
            active: data.active
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Impossible de charger les données du produit');
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEditing 
        ? `http://localhost:3000/api/products/${id}`
        : 'http://localhost:3000/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      navigate('/products');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur serveur');
      setLoading(false);
    }
  };

  return (
    <div className="view">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/products')}>
            <ArrowLeft size={16} />
          </button>
          <h4>{isEditing ? 'Modifier le Produit' : 'Nouveau Produit'}</h4>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" style={{ 
              backgroundColor: '#fee2e2', 
              color: '#ef4444', 
              padding: '0.75rem', 
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom du produit / service *</label>
              <input 
                type="text" 
                name="name"
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem' }}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="col" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>SKU (Référence)</label>
                    <input type="text" name="sku" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.sku} onChange={handleChange} />
                </div>
                <div className="col" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Catégorie</label>
                    <input type="text" name="category" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.category} onChange={handleChange} list="categories" />
                    <datalist id="categories">
                        <option value="Services" />
                        <option value="Produits" />
                        <option value="Licences" />
                        <option value="Consulting" />
                    </datalist>
                </div>
            </div>

            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="col" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prix Unitaire HT *</label>
                    <input type="number" name="price" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.price} onChange={handleChange} min="0" step="0.01" required />
                </div>
                <div className="col" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Taux TVA (%)</label>
                    <select name="vat_rate" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.vat_rate} onChange={handleChange}>
                        <option value="21.00">21%</option>
                        <option value="12.00">12%</option>
                        <option value="6.00">6%</option>
                        <option value="0.00">0%</option>
                    </select>
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <textarea 
                name="description"
                className="form-control" 
                style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="active">Produit Actif (visible dans les listes)</label>
                <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
               <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>Annuler</button>
               <button type="submit" className="btn btn-success" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;
