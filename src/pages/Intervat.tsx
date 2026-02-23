import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, FileText } from 'lucide-react';

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

const Intervat = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [grid, setGrid] = useState<VatGrid | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateVat = () => {
    setLoading(true);
    fetch(`http://localhost:3000/api/intervat/calculate?year=${year}&quarter=${quarter}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setGrid(data.grid);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    calculateVat();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleExportXML = () => {
    alert("L'export XML Intervat sera implémenté dans une prochaine version.");
  };

  return (
    <div className="view">
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={24} color="#0057B8" />
                <h4 style={{ margin: 0 }}>Déclaration TVA (Intervat)</h4>
            </div>
            <button className="btn btn-outline" onClick={handleExportXML} disabled={!grid}>
                <Download size={16} style={{ marginRight: '0.5rem' }} /> Export XML
            </button>
        </div>
        
        <div className="card-body">
            {/* Period Selector */}
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', color: '#666' }}>Année</label>
                    <input type="number" className="form-control" style={{ width: '100%' }} value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', color: '#666' }}>Trimestre</label>
                    <select className="form-control" style={{ width: '100%' }} value={quarter} onChange={(e) => setQuarter(parseInt(e.target.value))}>
                        <option value="1">1er Trimestre (Jan-Mar)</option>
                        <option value="2">2ème Trimestre (Avr-Juin)</option>
                        <option value="3">3ème Trimestre (Juil-Sep)</option>
                        <option value="4">4ème Trimestre (Oct-Déc)</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={calculateVat} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Calcul...' : 'Calculer'}
                </button>
            </div>

            {/* VAT Grid Representation */}
            {grid && (
                <div className="vat-grid-container" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div style={{ background: '#eee', padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                        I. Opérations à la sortie (Ventes)
                    </div>
                    
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Opérations soumises à un taux particulier (0%)</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[00]</span>
                            {formatCurrency(grid['00'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Opérations à 6%</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[01]</span>
                            {formatCurrency(grid['01'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Opérations à 12%</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[02]</span>
                            {formatCurrency(grid['02'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Opérations à 21%</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[03]</span>
                            {formatCurrency(grid['03'])}
                        </div>
                    </div>

                    <div style={{ background: '#eee', padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                        II. Opérations à l'entrée (Achats)
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Marchandises, matières premières et auxiliaires</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[81]</span>
                            {formatCurrency(grid['81'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Services et biens divers</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[82]</span>
                            {formatCurrency(grid['82'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Biens d'investissement</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[83]</span>
                            {formatCurrency(grid['83'])}
                        </div>
                    </div>

                    <div style={{ background: '#eee', padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                        III. Taxes Dues
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Taxe due sur opérations grille I</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[54]</span>
                            {formatCurrency(grid['54'])}
                        </div>
                    </div>

                    <div style={{ background: '#eee', padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                        IV. Taxes Déductibles
                    </div>
                    <div className="grid-row" style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Taxe déductible</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', background: '#fafafa' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[59]</span>
                            {formatCurrency(grid['59'])}
                        </div>
                    </div>

                    <div style={{ background: '#0057B8', color: 'white', padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                        V. Solde
                    </div>
                    <div className="grid-row" style={{ display: 'flex', background: grid['71'] > 0 ? '#fff0f0' : 'white' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Taxe due à l'État</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[71]</span>
                            {formatCurrency(grid['71'])}
                        </div>
                    </div>
                    <div className="grid-row" style={{ display: 'flex', background: grid['72'] > 0 ? '#f0fff4' : 'white' }}>
                        <div style={{ flex: 3, padding: '0.75rem', borderRight: '1px solid #eee' }}>Somme due par l'État</div>
                        <div style={{ flex: 1, padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                            <span style={{ color: '#999', fontSize: '0.8em', marginRight: '0.5rem' }}>[72]</span>
                            {formatCurrency(grid['72'])}
                        </div>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Intervat;
