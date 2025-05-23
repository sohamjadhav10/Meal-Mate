
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navigateToDashboard = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="cursor-pointer" onClick={navigateToDashboard}>
          <Logo />
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm hidden sm:block">
              <span className="text-gray-500">Welcome, </span>
              <span className="font-medium">{user.name}</span>
              {isAdmin && (
                <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Admin
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-corporate-700 hover:text-corporate-800 hover:bg-corporate-50"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
