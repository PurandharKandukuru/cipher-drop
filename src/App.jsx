/**
 * App.jsx
 * Main application component with React Router, Auth, and Theme Providers
 * Uses React.lazy for code-splitting to improve initial load performance
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, AnimatedBackground } from './components';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Lazy load all pages for code-splitting
// This reduces initial bundle size by ~30-40%
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ShareLinkPage = lazy(() => import('./pages/ShareLinkPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));

/**
 * Loading spinner for Suspense fallback
 */
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-text-muted text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Global animated background — skipped on DashboardLayout routes, which render
 * their own background (prevents a hidden/duplicate canvas burning CPU and
 * causing scroll jank).
 */
const GlobalBackground = () => {
  const { pathname } = useLocation();
  const ownsBackground =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/upload') ||
    pathname.startsWith('/share');
  if (ownsBackground) return null;
  return <AnimatedBackground />;
};

/**
 * App Routes
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/share/:fileId"
        element={
          <ProtectedRoute>
            <ShareLinkPage />
          </ProtectedRoute>
        }
      />

      {/* Public Download Route */}
      <Route path="/download/:fileId" element={<DownloadPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <GlobalBackground />
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
            <PWAInstallPrompt />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
