import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import HomePage from './pages/HomePage';
import CreateRidePage from './pages/CreateRidePage';
import RideDetailPage from './pages/RideDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const location = useLocation();

  return (

    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create"
          element={
            <ProtectedRoute allowedRoles={['driver', 'admin']}>
              <CreateRidePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ride/:id"
          element={
            <ProtectedRoute>
              <RideDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}