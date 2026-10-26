import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useCallback(() => {
    logout();
    qc.clear();
    navigate('/login', { replace: true });
  }, [logout, navigate, qc]);
}
