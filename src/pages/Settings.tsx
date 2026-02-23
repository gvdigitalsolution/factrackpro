import React, { useState, useEffect } from 'react';
import { Save, Upload, Building, CreditCard, Image } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'address' | 'bank' | 'logo'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    company_name: '',
    tva_number: '',
    email: '',
    phone: '',
    website: '',
    
    street: '',
    city: '',
    zip_code: '',
    country: '',
    
    bank_name: '',
    iban: '',
    bic: '',
    
    logo_path: ''
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/settings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setSettings({
          company_name: data.company_name || '',
          tva_number: data.tva_number || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          
          street: data.street || '',
          city: data.city || '',
          zip_code: data.zip_code || '',
          country: data.country || '',
          
          bank_name: data.bank_name || '',
          iban: data.iban || '',
          bic: data.bic || '',
          
          logo_path: data.logo_path || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Paramètres enregistrés avec succès');
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validation
    if (file.size > 500 * 1024) {
      alert('Le fichier est trop volumineux (Max 500KB)');
      return;
    }

    // Check dimensions (optional but requested)
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if (img.width > 512 || img.height > 512) {
        alert('Les dimensions de l\'image ne doivent pas dépasser 512x512 pixels');
        return;
      }

      // Upload if valid
      const formData = new FormData();
      formData.append('logo', file);

      try {
        const res = await fetch('http://localhost:3000/api/settings/logo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, logo_path: data.path }));
          alert('Logo mis à jour');
        } else {
          alert('Erreur lors de l\'upload');
        }
      } catch (err) {
        console.error(err);
        alert('Erreur serveur');
      }
    };
  };

  if (loading) return <div className="view">Chargement...</div>;

  return (
    <div className="view">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h4>Paramètres de l'entreprise</h4>
        </div>
        
        <div className="card-body">
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '2rem' }}>
            <button 
              onClick={() => setActiveTab('general')}
              style={{ 
                padding: '1rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'general' ? '2px solid #0057B8' : 'none',
                color: activeTab === 'general' ? '#0057B8' : '#666',
                fontWeight: activeTab === 'general' ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Building size={18} /> Général
            </button>
            <button 
              onClick={() => setActiveTab('address')}
              style={{ 
                padding: '1rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'address' ? '2px solid #0057B8' : 'none',
                color: activeTab === 'address' ? '#0057B8' : '#666',
                fontWeight: activeTab === 'address' ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Building size={18} /> Adresse
            </button>
            <button 
              onClick={() => setActiveTab('bank')}
              style={{ 
                padding: '1rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'bank' ? '2px solid #0057B8' : 'none',
                color: activeTab === 'bank' ? '#0057B8' : '#666',
                fontWeight: activeTab === 'bank' ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <CreditCard size={18} /> Banque
            </button>
            <button 
              onClick={() => setActiveTab('logo')}
              style={{ 
                padding: '1rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'logo' ? '2px solid #0057B8' : 'none',
                color: activeTab === 'logo' ? '#0057B8' : '#666',
                fontWeight: activeTab === 'logo' ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Image size={18} /> Logo
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            
            {activeTab === 'general' && (
              <div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom de l'entreprise *</label>
                  <input type="text" name="company_name" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.company_name} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Numéro de TVA</label>
                  <input type="text" name="tva_number" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.tva_number} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                  <input type="email" name="email" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.email} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Téléphone</label>
                  <input type="tel" name="phone" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.phone} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Site Web</label>
                  <input type="url" name="website" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.website} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rue</label>
                  <input type="text" name="street" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.street} onChange={handleChange} />
                </div>
                <div className="row" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="col" style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Code Postal</label>
                        <input type="text" name="zip_code" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.zip_code} onChange={handleChange} />
                    </div>
                    <div className="col" style={{ flex: 2 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ville</label>
                        <input type="text" name="city" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.city} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pays</label>
                  <input type="text" name="country" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.country} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nom de la banque</label>
                  <input type="text" name="bank_name" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.bank_name} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>IBAN</label>
                  <input type="text" name="iban" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.iban} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>BIC / SWIFT</label>
                  <input type="text" name="bic" className="form-control" style={{ width: '100%', padding: '0.5rem' }} value={settings.bic} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'logo' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                {settings.logo_path ? (
                    <div style={{ marginBottom: '2rem' }}>
                        <img 
                            src={`http://localhost:3000${settings.logo_path}`} 
                            alt="Logo" 
                            style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }} 
                        />
                    </div>
                ) : (
                    <div style={{ marginBottom: '2rem', color: '#999' }}>
                        Aucun logo défini
                    </div>
                )}
                
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="logo-upload" className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={16} /> Choisir un fichier
                    </label>
                    <input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        style={{ display: 'none' }} 
                    />
                </div>
                <p style={{ fontSize: '0.8em', color: '#666' }}>Max 500KB. Dimensions max 512x512px.</p>
              </div>
            )}

            {activeTab !== 'logo' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-success" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
