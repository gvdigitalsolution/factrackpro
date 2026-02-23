import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, FileText, ChevronRight } from 'lucide-react';

interface VatGrid {
  '00': number;
  '01': number;
  '02': number;
  '03': number;
  '54': number;
  '81': number;
  '82': number;
  '83': number;
  '59': number;
  '71': number;
  '72': number;
}

const Accounting = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [grid, setGrid] = useState<VatGrid | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateVat = () => {
    setLoading(true);
    setError('');
    
    fetch(`http://localhost:3000/api/accounting/vat?year=${year}&quarter=${quarter}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du calcul');
        return res.json();
      })
      .then(data => {
        setGrid(data.grid);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Impossible de récupérer les données comptables.');
        setLoading(false);
      });
  };

  useEffect(() => {
    calculateVat();
  }, []); // Initial load

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  return (
    <div className="view">
      <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={24} color="#0057B8" />
                <h4 style={{ margin: 0 }}>Déclaration TVA (Intervat)</h4>
            </div>
            <div>
                 <button className="btn btn-primary" onClick={calculateVat} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Calcul...' : 'Actualiser'}
                </button>
            </div>
        </div>
        
        <div className="card-body">
            {/* Period Selector */}
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '0.5rem', color: '#374151' }}>Année Exercice</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        style={{ width: '100%', padding: '0.75rem' }} 
                        value={year} 
                        onChange={(e) => setYear(parseInt(e.target.value))} 
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '0.5rem', color: '#374151' }}>Période (Trimestre)</label>
                    <select 
                        className="form-control" 
                        style={{ width: '100%', padding: '0.75rem' }} 
                        value={quarter} 
                        onChange={(e) => setQuarter(parseInt(e.target.value))}
                    >
                        <option value="1">1er Trimestre (Jan - Mar)</option>
                        <option value="2">2ème Trimestre (Avr - Juin)</option>
                        <option value="3">3ème Trimestre (Juil - Sep)</option>
                        <option value="4">4ème Trimestre (Oct - Déc)</option>
                    </select>
                </div>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '6px' }}>{error}</div>}

            {/* VAT Grid Representation */}
            {grid ? (
                <div className="vat-grid-container" style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                    
                    {/* SECTION I: SORTIES */}
                    <div style={{ background: '#f3f4f6', padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #d1d5db', color: '#1f2937' }}>
                        I. Opérations à la sortie (Ventes)
                    </div>
                    
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Opérations à 0% (Intracommunautaire, etc.)</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[00]</span>
                            {formatCurrency(grid['00'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Opérations à 6%</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[01]</span>
                            {formatCurrency(grid['01'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Opérations à 12%</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[02]</span>
                            {formatCurrency(grid['02'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #d1d5db' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Opérations à 21%</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[03]</span>
                            {formatCurrency(grid['03'])}
                        </div>
                    </div>

                    {/* SECTION II: ENTREES */}
                    <div style={{ background: '#f3f4f6', padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #d1d5db', color: '#1f2937' }}>
                        II. Opérations à l'entrée (Achats)
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Marchandises, matières premières et auxiliaires</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[81]</span>
                            {formatCurrency(grid['81'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Services et biens divers</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[82]</span>
                            {formatCurrency(grid['82'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #d1d5db' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Biens d'investissement</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f9fafb', borderLeft: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[83]</span>
                            {formatCurrency(grid['83'])}
                        </div>
                    </div>

                    {/* SECTION III: TAXES DUES */}
                    <div style={{ background: '#f3f4f6', padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #d1d5db', color: '#1f2937' }}>
                        III. Taxes Dues
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #d1d5db' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Taxe due sur opérations grille I</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#fff7ed', borderLeft: '1px solid #e5e7eb', color: '#c2410c' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[54]</span>
                            {formatCurrency(grid['54'])}
                        </div>
                    </div>

                    {/* SECTION IV: TAXES DEDUCTIBLES */}
                    <div style={{ background: '#f3f4f6', padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #d1d5db', color: '#1f2937' }}>
                        IV. Taxes Déductibles
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #d1d5db' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>Taxe déductible</div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', background: '#f0fdf4', borderLeft: '1px solid #e5e7eb', color: '#15803d' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[59]</span>
                            {formatCurrency(grid['59'])}
                        </div>
                    </div>

                    {/* SECTION V: SOLDE */}
                    <div style={{ background: '#0057B8', color: 'white', padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #004494' }}>
                        V. Solde
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: grid['71'] > 0 ? '#fee2e2' : 'white' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', fontWeight: grid['71'] > 0 ? 'bold' : 'normal', color: grid['71'] > 0 ? '#991b1b' : 'inherit' }}>
                            Taxe due à l'État
                        </div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', borderLeft: '1px solid #e5e7eb', color: grid['71'] > 0 ? '#991b1b' : 'inherit' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[71]</span>
                            {formatCurrency(grid['71'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', background: grid['72'] > 0 ? '#dcfce7' : 'white' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', fontWeight: grid['72'] > 0 ? 'bold' : 'normal', color: grid['72'] > 0 ? '#166534' : 'inherit' }}>
                            Somme due par l'État
                        </div>
                        <div style={{ width: '150px', padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', borderLeft: '1px solid #e5e7eb', color: grid['72'] > 0 ? '#166534' : 'inherit' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.8em', marginRight: '0.5rem' }}>[72]</span>
                            {formatCurrency(grid['72'])}
                        </div>
                    </div>

                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Aucune donnée disponible pour cette période.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Accounting;
