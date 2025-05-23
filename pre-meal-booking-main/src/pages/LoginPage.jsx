
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import PageContainer from '@/components/PageContainer';
import Logo from '@/components/Logo';

const LoginPage = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [rfidCardId, setRfidCardId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeId.trim()) {
      toast.error('Employee ID is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(employeeId, rfidCardId, password);
      
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate QR code scanning (in a real app, this would be connected to a scanner)
  const handleQrScan = () => {
    // Mock QR scan data
    const mockEmployeeData = {
      employeeId: '1234',
      rfidCardId: 'RFID12345'
    };
    
    setEmployeeId(mockEmployeeData.employeeId);
    setRfidCardId(mockEmployeeData.rfidCardId);
    toast.info('QR code scanned successfully');
  };

  return (
    <PageContainer showHeader={false} className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your employee ID to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                placeholder="Enter your employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfidCardId">RFID Card ID (Optional)</Label>
              <Input
                id="rfidCardId"
                placeholder="Enter your RFID card ID if available"
                value={rfidCardId}
                onChange={(e) => setRfidCardId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be auto-filled if linked with your account
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              className="w-full bg-corporate-600 hover:bg-corporate-700" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleQrScan}
          >
            Scan QR Code
          </Button>
          <div className="text-center text-sm text-gray-500">
            For admin access use: <span className="font-medium">admin</span>
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default LoginPage;
