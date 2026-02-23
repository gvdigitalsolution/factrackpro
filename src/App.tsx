import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientEditor from './pages/ClientEditor';
import Documents from './pages/Documents';
import DocumentEditor from './pages/DocumentEditor';
import Payments from './pages/Payments';
import PaymentEditor from './pages/PaymentEditor';
import Products from './pages/Products';
import ProductEditor from './pages/ProductEditor';
import Accounting from './pages/Accounting';
import Intervat from './pages/Intervat';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientEditor />} />
            <Route path="clients/edit/:id" element={<ClientEditor />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/new" element={<DocumentEditor />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payments/new" element={<PaymentEditor />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/edit/:id" element={<ProductEditor />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="intervat" element={<Intervat />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
