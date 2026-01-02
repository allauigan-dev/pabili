import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './client/components/layout/Layout';
import { Dashboard } from './client/pages/Dashboard';
import { OrdersPage } from './client/pages/orders/OrdersPage';
import { OrderForm } from './client/pages/orders/OrderForm';
import { StoresPage } from './client/pages/stores/StoresPage';
import { StoreForm } from './client/pages/stores/StoreForm';
import { ResellersPage } from './client/pages/resellers/ResellersPage';
import { ResellerForm } from './client/pages/resellers/ResellerForm';
import { PaymentsPage } from './client/pages/payments/PaymentsPage';
import { PaymentForm } from './client/pages/payments/PaymentForm';
import { InvoicesPage } from './client/pages/invoices/InvoicesPage';
import { InvoiceForm } from './client/pages/invoices/InvoiceForm';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/stores/new" element={<StoreForm />} />
          <Route path="/stores/:id/edit" element={<StoreForm />} />
          <Route path="/resellers" element={<ResellersPage />} />
          <Route path="/resellers/new" element={<ResellerForm />} />
          <Route path="/resellers/:id/edit" element={<ResellerForm />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payments/new" element={<PaymentForm />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<InvoiceForm />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
