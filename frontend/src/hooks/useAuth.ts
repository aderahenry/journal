import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) {
      dispatch(logout());
    }
  }, [token, dispatch]);

  return {
    isAuthenticated,
    token,
    isLoading,
    logout: () => dispatch(logout()),
  };
}; 