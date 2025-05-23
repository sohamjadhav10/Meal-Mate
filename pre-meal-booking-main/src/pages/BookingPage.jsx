
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import PageContainer from '@/components/PageContainer';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const mealIdParam = searchParams.get('mealId');
  
  const { user } = useAuth();
  const { getMealCategories, createBooking, getAvailableDates } = useBooking();
  const navigate = useNavigate();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [meal, setMeal] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  
  const mealCategories = getMealCategories();
  const availableDates = getAvailableDates();
  
  useEffect(() => {
    if (!dateParam || !mealIdParam) {
      toast.error('Missing booking information');
      navigate('/dashboard');
      return;
    }
    
    const foundMeal = mealCategories.find(m => m.id === mealIdParam);
    if (!foundMeal) {
      toast.error('Invalid meal selected');
      navigate('/dashboard');
      return;
    }
    
    const foundDate = availableDates.find(d => d.formatted === dateParam);
    if (!foundDate) {
      toast.error('Invalid date selected');
      navigate('/dashboard');
      return;
    }
    
    setMeal(foundMeal);
    setBookingDate(foundDate);
  }, [dateParam, mealIdParam]);
  
  const handleConfirmBooking = async () => {
    if (!meal || !bookingDate) return;
    
    setIsProcessing(true);
    
    try {
      // Check if wallet balance is sufficient when paying with wallet
      if (selectedPaymentMethod === 'wallet' && user.walletBalance < meal.price) {
        toast.error('Insufficient wallet balance');
        setIsProcessing(false);
        return;
      }
      
      const bookingData = {
        employeeId: user.employeeId,
        employeeName: user.name,
        rfidCardId: user.rfidCardId,
        date: dateParam,
        mealCategory: {
          id: meal.id,
          name: meal.name,
          price: meal.price,
          availableTime: meal.availableTime
        },
        paymentMethod: selectedPaymentMethod,
        amount: meal.price,
        paymentStatus: 'completed'
      };
      
      const result = await fetch('https://meal-mate-hegm.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      const data = await result.json();
      
      if (data.success) {
        navigate('/confirmation');
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!meal || !bookingDate) {
    return (
      <PageContainer>
        <div className="container mx-auto px-4 py-8 text-center">
          Loading booking information...
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Confirm Your Booking</h1>
          <p className="text-gray-600 mt-2">Review and complete your meal booking</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Review your meal booking information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{bookingDate.display}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Meal Type</p>
                <p className="font-medium">{meal.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Timing</p>
                <p className="font-medium">{meal.availableTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">₹{meal.price}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Meal Options:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {meal.items.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex flex-col cursor-pointer">
                  <span>Wallet Balance</span>
                  <span className="text-sm text-gray-500">
                    Available: ₹{user.walletBalance} 
                    {user.walletBalance < meal.price && (
                      <span className="text-red-500 ml-2">Insufficient balance</span>
                    )}
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="cursor-pointer">UPI Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payroll" id="payroll" />
                <Label htmlFor="payroll" className="cursor-pointer">Payroll Deduction</Label>
              </div>
            </RadioGroup>
            
            {selectedPaymentMethod === 'upi' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-center text-sm mb-3">Scan QR code to pay ₹{meal.price}</p>
                <div className="w-40 h-40 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-xs text-gray-500">UPI QR Code Mockup</div>
                </div>
                <p className="text-center text-xs mt-3 text-gray-500">
                  Or pay to UPI ID: mealmate@upi
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Back
          </Button>
          <Button 
            className="bg-corporate-600 hover:bg-corporate-700"
            onClick={handleConfirmBooking}
            disabled={isProcessing || (selectedPaymentMethod === 'wallet' && user.walletBalance < meal.price)}
          >
            {isProcessing ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default BookingPage;
