import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '../store/slices/authSlice';

// Create a simple mock reducer for API
const apiReducer = (state = {}, action: any) => {
  return state;
};

// Create a mock store for testing
const mockStore = configureStore({
  reducer: {
    api: apiReducer,
    auth: authReducer,
  }
});

export const store = mockStore;

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method and export store
export { customRender as render }; 