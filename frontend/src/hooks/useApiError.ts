import { useState, useEffect } from 'react';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setError(null);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError({
        message: err.message,
      });
    } else if (typeof err === 'object' && err !== null) {
      const apiError = err as ApiError;
      setError({
        message: apiError.message || 'An unexpected error occurred',
        code: apiError.code,
        status: apiError.status,
      });
    } else {
      setError({
        message: 'An unexpected error occurred',
      });
    }
  };

  const clearError = () => {
    setError(null);
    setIsVisible(false);
  };

  return {
    error,
    isVisible,
    handleError,
    clearError,
  };
}; 