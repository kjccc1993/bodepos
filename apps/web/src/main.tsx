import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from '@/components/Provider';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { CartProvider } from '@/lib/cart/CartContext';
import { router } from '@/router';
import '@/index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Provider>
            <RouterProvider router={router} />
          </Provider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
