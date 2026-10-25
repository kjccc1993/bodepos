import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PosShell } from '@/components/PosShell';
import { LoginPage } from '@/pages/LoginPage';
import { SellPage } from '@/pages/SellPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CartPage } from '@/pages/CartPage';
import { AccountingPage } from '@/pages/AccountingPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { DailyIncomesPage } from '@/pages/DailyIncomesPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { getToken } from '@/lib/http/client';

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <PosShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/sell" replace /> },
      { path: 'sell', element: <SellPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'accounting', element: <AccountingPage /> },
      { path: 'accounting/invoices', element: <InvoicesPage /> },
      { path: 'accounting/daily-incomes', element: <DailyIncomesPage /> },
      { path: 'accounting/customers', element: <CustomersPage /> },
      { path: 'accounting/customers/:customerId', element: <CustomerDetailPage /> },
      { path: 'settings', element: <Navigate to="/sell" replace /> },
    ],
  },
]);
