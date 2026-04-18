import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const CreateRidePage = lazy(() => import('./pages/CreateRidePage'));
const RideDetailPage = lazy(() => import('./pages/RideDetailPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Загрузка...</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <HelmetProvider>
      <Suspense fallback={<LoadingFallback />}>
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
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </HelmetProvider>
  );
}