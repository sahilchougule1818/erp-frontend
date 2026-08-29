import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Login } from './auth/NewLogin';
import { AppLayout } from './layout/AppLayout';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from './shared/ui/Toaster';

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthenticatedApp />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}
