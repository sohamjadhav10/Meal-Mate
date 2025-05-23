
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const PageContainer = ({ children, showHeader = true, className = '', requireAuth = true }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if authentication is required but user is not logged in
    if (!loading && requireAuth && !user && window.location.pathname !== '/' && window.location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, loading, navigate, requireAuth]);

  // Show loading state while checking authentication
  if (loading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corporate-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeader && user && <Header />}
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default PageContainer;
