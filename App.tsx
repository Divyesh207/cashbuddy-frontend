import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TourProvider } from './context/TourContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Savings from './pages/Savings';
import Budget from './pages/Budget';
import History from './pages/History';
import Trends from './pages/Trends';
import Debts from './pages/Debts';
import Help from './pages/Help';
import Layout from './components/Layout';

// Refactored ProtectedRoute to use Outlet pattern instead of children prop
// This avoids strict type issues with children props in some environments
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TourProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Using Layout Route pattern for protected pages */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/debts" element={<Debts />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/history" element={<History />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/help" element={<Help />} />
              </Route>
            </Routes>
          </Router>
        </TourProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;