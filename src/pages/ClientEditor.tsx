import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

const ClientEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<'billing' | 'shipping'>('billing');

  const [formData, setFormData] = useState({
    // Company Info
    name: '',
    client_number: '',
    group_name: '',
    assigned_user: '',
    identification_number: '',
    tva: '',
    website: '',
    phone: '',
    routing_id: '',
    vat_valid: false,
    tax_exempt: false,
    classification: '',
    
    // Contact Info
    contact_first_name: '',
    contact_last_name: '',
    contact_email: '', // Primary contact email
    contact_phone: '',
    email: '', // Company main email
    contact_add_to_invoices: false,

    // Billing Address
    billing_street: '',
    billing_apt: '',
    billing_city: '',
    billing_region: '',
    billing_zip: '',
    billing_country: '',

    // Shipping Address
    shipping_street: '',
    shipping_apt: '',
    shipping_city: '',
    shipping_region: '',
    shipping_zip: '',
    shipping_country: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`http://localhost:3000/api/clients/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Client non trouvé');
          return res.json();
        })
        .then(data => {
          setFormData({
            name: data.name || '',
            client_number: data.client_number || '',
            group_name: data.group_name || '',
            assigned_user: data.assigned_user || '',
            identification_number: data.identification_number || '',
            tva: data.tva || '',
            website: data.website || '',
            phone: data.phone || '',
            routing_id: data.routing_id || '',
            vat_valid: data.vat_valid || false,
            tax_exempt: data.tax_exempt || false,
            classification: data.classification || '',

            contact_first_name: data.contact_first_name || '',
            contact_last_name: data.contact_last_name || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            email: data.email || '',
            contact_add_to_invoices: data.contact_add_to_invoices || false,

            billing_street: data.billing_street || '',
            billing_apt: data.billing_apt || '',
            billing_city: data.billing_city || '',
            billing_region: data.billing_region || '',
            billing_zip: data.billing_zip || '',
            billing_country: data.billing_country || '',

            shipping_street: data.shipping_street || '',
            shipping_apt: data.shipping_apt || '',
            shipping_city: data.shipping_city || '',
            shipping_region: data.shipping_region || '',
            shipping_zip: data.shipping_zip || '',
            shipping_country: data.shipping_country || ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Impossible de charger les données du client');
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        ? `http://localhost:3000/api/clients/${id}`
        : 'http://localhost:3000/api/clients';
      
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

      navigate('/clients');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur serveur');
      setLoading(false);
    }
  };

  if (loading && isEditing && !formData.name) {
    return <div className="view">Chargement...</div>;
  }

  return (
    <div className="view">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/clients')}>
            <ArrowLeft size={16} />
          </button>
          <h4>{isEditing ? 'Modifier le Client' : 'Nouveau Client'}</h4>
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
            {/* Informations sur l'entreprise */}
            <h5 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Informations sur l'entreprise</h5>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom</label>
              <input type="text" name="name" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.name} onChange={handleChange} required />
            </div>

            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="col" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Numéro</label>
                    <input type="text" name="client_number" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.client_number} onChange={handleChange} />
                </div>
                <div className="col" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Groupe</label>
                    <select name="group_name" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.group_name} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option value="VIP">VIP</option>
                        <option value="Standard">Standard</option>
                    </select>
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Utilisateur assigné</label>
                <select name="assigned_user" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.assigned_user} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="Admin">Administrateur</option>
                    <option value="User">Utilisateur</option>
                </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Numéro ID</label>
                <input type="text" name="identification_number" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.identification_number} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Numéro de TVA</label>
                <input type="text" name="tva" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.tva} onChange={handleChange} placeholder="BE0..." />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Site web</label>
                <input type="url" name="website" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.website} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Téléphone (Entreprise)</label>
                <input type="tel" name="phone" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID de routage</label>
                <input type="text" name="routing_id" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.routing_id} onChange={handleChange} />
            </div>

            <div className="row" style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="vat_valid">Numéro de TVA valide</label>
                    <input type="checkbox" id="vat_valid" name="vat_valid" checked={formData.vat_valid} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="tax_exempt">Dispensé de taxe</label>
                    <input type="checkbox" id="tax_exempt" name="tax_exempt" checked={formData.tax_exempt} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Classification</label>
                <select name="classification" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.classification} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="A">Catégorie A</option>
                    <option value="B">Catégorie B</option>
                </select>
            </div>

            {/* Informations de contact */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                <h5 style={{ margin: 0 }}>Informations de contact</h5>
                <button type="button" className="btn btn-outline btn-sm">+ Ajouter un contact</button>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prénom</label>
                <input type="text" name="contact_first_name" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.contact_first_name} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom</label>
                <input type="text" name="contact_last_name" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.contact_last_name} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>E-mail (Contact)</label>
                <input type="email" name="contact_email" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.contact_email} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Téléphone (Contact)</label>
                <input type="tel" name="contact_phone" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.contact_phone} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="contact_add_to_invoices">Ajouter aux factures</label>
                <input type="checkbox" id="contact_add_to_invoices" name="contact_add_to_invoices" checked={formData.contact_add_to_invoices} onChange={handleChange} />
            </div>

            {/* Adresse */}
            <h5 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Adresse</h5>
            
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                <button 
                    type="button"
                    onClick={() => setActiveTab('billing')}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'billing' ? '2px solid #0057B8' : 'none',
                        color: activeTab === 'billing' ? '#0057B8' : '#666',
                        fontWeight: activeTab === 'billing' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Adresse de facturation
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('shipping')}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'shipping' ? '2px solid #0057B8' : 'none',
                        color: activeTab === 'shipping' ? '#0057B8' : '#666',
                        fontWeight: activeTab === 'shipping' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Adresse de Livraison
                </button>
            </div>

            {activeTab === 'billing' ? (
                <div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rue</label>
                        <input type="text" name="billing_street" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.billing_street} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Appt/Bâtiment</label>
                        <input type="text" name="billing_apt" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.billing_apt} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ville</label>
                        <input type="text" name="billing_city" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.billing_city} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Région/Département</label>
                        <input type="text" name="billing_region" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.billing_region} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Code postal</label>
                        <input type="text" name="billing_zip" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.billing_zip} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pays</label>
                        <select name="billing_country" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.billing_country} onChange={handleChange}>
                            <option value="">Select...</option>
                            <option value="Belgique">Belgique</option>
                            <option value="France">France</option>
                            <option value="Luxembourg">Luxembourg</option>
                        </select>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rue</label>
                        <input type="text" name="shipping_street" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.shipping_street} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Appt/Bâtiment</label>
                        <input type="text" name="shipping_apt" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.shipping_apt} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ville</label>
                        <input type="text" name="shipping_city" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.shipping_city} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Région/Département</label>
                        <input type="text" name="shipping_region" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.shipping_region} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Code postal</label>
                        <input type="text" name="shipping_zip" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.shipping_zip} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pays</label>
                        <select name="shipping_country" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={formData.shipping_country} onChange={handleChange}>
                            <option value="">Select...</option>
                            <option value="Belgique">Belgique</option>
                            <option value="France">France</option>
                            <option value="Luxembourg">Luxembourg</option>
                        </select>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
               <button type="button" className="btn btn-outline" onClick={() => navigate('/clients')}>Annuler</button>
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

export default ClientEditor;
