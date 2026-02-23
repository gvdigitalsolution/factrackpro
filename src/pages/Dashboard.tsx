
const Dashboard = () => {
  return (
    <div id="dashboard-view" className="view">
        <div className="welcome-card">
            <div>
                <h3>Bienvenue, <span id="welcomeOwnerName">Utilisateur</span></h3>
                <p>Heure locale: <span id="welcomeDate">{new Date().toLocaleString()}</span></p>
            </div>
            <div className="welcome-actions">
                <button className="btn btn-success btn-sm">Nouvelle facture</button>
                <button className="btn btn-outline btn-sm" style={{ marginLeft: '0.5rem' }}>Ajouter un client</button>
            </div>
        </div>
        
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon">💶</div>
                <div className="stat-value" id="totalRevenue">€0.00</div>
                <div className="stat-label">CA ce mois</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value" id="yearRevenue">€0.00</div>
                <div className="stat-label">CA cette année</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value" id="allRevenue">€0.00</div>
                <div className="stat-label">CA cumulé</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">🧾</div>
                <div className="stat-value" id="pendingInvoices">0</div>
                <div className="stat-label">Factures en attente</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value" id="totalClients">0</div>
                <div className="stat-label">Clients</div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div className="stat-value text-danger" id="overdueAmount">€0.00</div>
                <div className="stat-label">En retard</div>
            </div>
        </div>

        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header">
                        <h4>Factures récentes</h4>
                        <button className="btn btn-primary btn-sm">Voir tout</button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table" id="recentInvoicesTable">
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Client</th>
                                        <th>Date</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Empty for now */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="card">
                    <div className="card-header">
                        <h4>Actions rapides</h4>
                    </div>
                    <div className="card-body">
                        <div className="d-flex flex-column gap-2">
                            <button className="btn btn-primary">
                                Nouvelle Facture
                            </button>
                            <button className="btn btn-outline">
                                Nouveau Devis
                            </button>
                            <button className="btn btn-outline">
                                Ajouter un Client
                            </button>
                            <button className="btn btn-outline">
                                Gérer les Produits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
