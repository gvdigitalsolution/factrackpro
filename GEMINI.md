# FactTrack Pro - Cahier des Charges

FactTrack Pro est une application de gestion commerciale et de facturation conçue spécifiquement pour les indépendants et petites entreprises, avec un focus particulier sur le marché belge (conformité Intervat).

## 1. Objectifs de l'Application
- Centraliser la gestion des clients et des produits.
- Faciliter la création et le suivi de devis et factures.
- Automatiser le calcul des déclarations TVA (Grilles Intervat).
- Offrir une vue d'ensemble de la santé financière via un tableau de bord.

## 2. Fonctionnalités Principales

### 2.1 Authentification et Sécurité
- Inscription et connexion sécurisées.
- Protection des routes via JWT.
- Gestion du profil utilisateur et des informations d'entreprise (Settings).

### 2.2 Tableau de Bord (Dashboard)
- Indicateurs clés (KPIs) : Chiffre d'affaires (mois/année/cumulé), factures en attente, nombre de clients, montants en retard.
- Liste des dernières factures émises.
- Raccourcis vers les actions rapides (Nouvelle facture, Nouveau client).

### 2.3 Gestion des Clients
- Liste exhaustive des clients.
- Éditeur de client : Nom, numéro de TVA (BE), adresse, contact.
- Historique des documents associés à chaque client.

### 2.4 Gestion des Documents (Invoices & Quotes)
- Création de factures et devis.
- État des documents (Brouillon, Envoyé, Payé, En retard).
- Génération (ou prévision) de PDF pour l'envoi aux clients.

### 2.5 Catalogue de Produits/Services
- Gestion des articles récurrents pour une saisie rapide dans les documents.
- Définition des prix unitaires et taux de TVA par défaut.

### 2.6 Suivi des Paiements
- Enregistrement des paiements reçus.
- Réconciliation avec les factures émises.

### 2.7 Module Comptabilité & Intervat (Spécificité Belge)
- **Calcul automatique des grilles TVA** :
  - Sorties (Ventes) : Grilles 00, 01, 02, 03.
  - Entrées (Achats) : Grilles 81, 82, 83.
  - Taxes dues/déductibles : Grilles 54, 59.
  - Solde : Grilles 71 (Dû à l'État) ou 72 (Dû par l'État).
- Exportation future au format XML pour le portail Intervat.

## 3. Architecture Technique

### 3.1 Frontend
- **Framework** : React 19 (TypeScript).
- **Build Tool** : Vite.
- **Routing** : React Router 7.
- **Icônes** : Lucide React.
- **Styles** : Vanilla CSS (approché par composants).

### 3.2 Backend & Données
- **Base de données** : PostgreSQL (hébergé via Neon DB).
- **Client DB** : `pg` (node-postgres).
- **Environnement** : Node.js (Express supposé pour l'API).

### 3.3 Tests & Qualité
- **Tests Unitaires** : Vitest.
- **Linting** : ESLint (config flat).
- **Typage** : TypeScript rigoureux.

## 4. Structure du Projet
- `src/components` : Composants UI réutilisables (Sidebar, TopBar, etc.).
- `src/pages` : Vues principales de l'application.
- `src/context` : Gestion de l'état global (Authentification).
- `src/Backend/server` : Logique serveur et connexion base de données.

## 5. Roadmap & Évolutions
- Implémentation de l'export XML Intervat.
- Génération automatique de PDF pour les factures.
- Graphiques d'évolution du CA sur le Dashboard.
- Gestion multi-utilisateurs/multi-entreprises.
