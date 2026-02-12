import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ProductionPage from './pages/Production.tsx';
import GadgetsPage from './pages/Gadgets.tsx';
import StockPage from './pages/Stock.tsx';
import SalesPage from './pages/Sales.tsx';
import ClientsPage from './pages/Clients.tsx';
import HRPage from './pages/HR.tsx';
import Login from './pages/Login.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import InvoicesListPage from './pages/InvoicesList.tsx';
import InvoicePage from './pages/Invoice.tsx';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="production" element={<ProductionPage />} />
              <Route path="gadgets" element={<GadgetsPage />} />
              <Route path="stocks" element={<StockPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="invoices" element={<InvoicesListPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="hr" element={<HRPage />} />
            </Route>
            <Route path="/sales/:id" element={<InvoicePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
