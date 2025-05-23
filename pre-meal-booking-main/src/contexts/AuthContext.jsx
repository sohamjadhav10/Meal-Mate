
import { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Sample user data for testing
const sampleUsers = [
  {
    id: 'EMP12345',
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'password123',
    walletBalance: 1250,
    rfidCardId: 'RFID987654321',
    isAdmin: false
  },
  {
    id: 'EMP67890',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'password123',
    walletBalance: 850,
    rfidCardId: 'RFID123456789',
    isAdmin: false
  },
  {
    id: 'ADMIN001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    walletBalance: 5000,
    rfidCardId: 'RFID000000001',
    isAdmin: true
  }
];

// Provider component
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check authentication from localStorage
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (employeeId, rfidCardId, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, rfidCardId, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          ...data.user,
          token: data.token
        };
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      
      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
  };
  
  // Update wallet balance
  const updateWalletBalance = (amount) => {
    if (user) {
      const updatedUser = {
        ...user,
        walletBalance: user.walletBalance - amount
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    }
    
    return false;
  };
  
  const value = {
    user,
    loading,
    isAdmin,
    login,
    logout,
    updateWalletBalance
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
