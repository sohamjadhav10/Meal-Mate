import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert } from '../components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import PageContainer from '../components/PageContainer';
import Logo from '../components/Logo';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: '',
    phone: '',
    rfidCardId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          password: formData.password,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          rfidCardId: formData.rfidCardId
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer showHeader={false} className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <CardTitle className="text-2xl font-bold">Register Account</CardTitle>
          <CardDescription>
            Create your employee account
          </CardDescription>
        </CardHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 mx-6">
            {error}
          </Alert>
        )}

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                name="employeeId"
                type="text"
                placeholder="Enter your employee ID"
                required
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfidCardId">RFID Card ID</Label>
              <Input
                id="rfidCardId"
                name="rfidCardId"
                type="text"
                placeholder="Enter your RFID card ID"
                required
                value={formData.rfidCardId}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-corporate-600 hover:bg-corporate-700"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
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
          <div className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-corporate-600 hover:text-corporate-700 font-medium"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Login here
            </a>
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default RegisterPage;