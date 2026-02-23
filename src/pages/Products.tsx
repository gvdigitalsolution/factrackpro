import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  vat_rate: number;
  active: boolean;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/products', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        fetchProducts();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  };

  return (
    <div className="view">
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Produits & Services</h4>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => navigate('/products/new')}
                >
                    <Plus size={16} /> Nouveau Produit
                </button>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '0.75rem' }}>SKU</th>
                                <th style={{ padding: '0.75rem' }}>Nom</th>
                                <th style={{ padding: '0.75rem' }}>Catégorie</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Prix HT</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>TVA</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Statut</th>
                                <th style={{ padding: '0.75rem', width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center' }}>Chargement...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Aucun produit trouvé.</td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.75rem', fontSize: '0.9em', color: '#666' }}>{product.sku || '-'}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{product.name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{ background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85em' }}>
                                                {product.category || 'Général'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>€{Number(product.price).toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{Number(product.vat_rate).toFixed(0)}%</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {product.active ? 
                                                <span style={{ color: '#00C49A', fontSize: '0.85em' }}>Actif</span> : 
                                                <span style={{ color: '#ef4444', fontSize: '0.85em' }}>Inactif</span>
                                            }
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                              className="btn btn-sm btn-outline" 
                                              title="Modifier"
                                              onClick={() => navigate(`/products/edit/${product.id}`)}
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button 
                                              className="btn btn-sm btn-outline" 
                                              style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                                              title="Supprimer"
                                              onClick={() => handleDelete(product.id)}
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

export default Products;
