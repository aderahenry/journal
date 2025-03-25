import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppTheme } from './theme';
import Layout from './components/Layout';
import EntryDetail from './pages/EntryDetail';
import EntryCreate from './pages/EntryCreate';
import EntryEdit from './pages/EntryEdit';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// App container that sets up Redux provider
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppWithTheme />
    </Provider>
  );
};

// Inner component that has access to Redux store for theming
const AppWithTheme: React.FC = () => {
  const theme = useAppTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="entries/new" element={<EntryCreate />} />
            <Route path="entries/:id" element={<EntryDetail />} />
            <Route path="entries/:id/edit" element={<EntryEdit />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
