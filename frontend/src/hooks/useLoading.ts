import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoading = (initialState: LoadingState = {}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const startLoading = useCallback((key: string) => {
    setLoadingState((prev) => ({
      ...prev,
      [key]: true,
    }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingState((prev) => ({
      ...prev,
      [key]: false,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingState[key] || false;
    },
    [loadingState]
  );

  const withLoading = useCallback(
    async <T,>(key: string, operation: () => Promise<T>): Promise<T> => {
      try {
        startLoading(key);
        const result = await operation();
        return result;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loadingState,
    startLoading,
    stopLoading,
    isLoading,
    withLoading,
  };
}; 