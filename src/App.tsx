import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './client/components/layout/Layout';
import { Dashboard } from './client/pages/Dashboard';
import { OrdersPage } from './client/pages/orders/OrdersPage';
import { OrderForm } from './client/pages/orders/OrderForm';
import { StoresPage } from './client/pages/stores/StoresPage';
import { StoreForm } from './client/pages/stores/StoreForm';
import { CustomersPage } from './client/pages/customers/CustomersPage';
import { CustomerForm } from './client/pages/customers/CustomerForm';
import { PaymentsPage } from './client/pages/payments/PaymentsPage';
import { PaymentForm } from './client/pages/payments/PaymentForm';
import { InvoicesPage } from './client/pages/invoices/InvoicesPage';
import { InvoiceForm } from './client/pages/invoices/InvoiceForm';
import { ProtectedRoute } from './client/components/ProtectedRoute';
import { OrgGuard } from './client/components/OrgGuard';
import { LoginPage } from './client/pages/auth/LoginPage';
import { OnboardingPage } from './client/pages/onboarding/OnboardingPage';

import { ScrollToTop } from './client/components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<OrgGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/orders/:id/edit" element={<OrderForm />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/stores/new" element={<StoreForm />} />
              <Route path="/stores/:id/edit" element={<StoreForm />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/payments/new" element={<PaymentForm />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/new" element={<InvoiceForm />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
