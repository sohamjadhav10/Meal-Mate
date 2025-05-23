
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import PageContainer from '@/components/PageContainer';

const ConfirmationPage = () => {
  const { currentBooking } = useBooking();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentBooking) {
      navigate('/dashboard');
    }
    
    // Simulate sending admin notification
    if (currentBooking) {
      console.log('Admin notification sent for booking:', currentBooking.id);
    }
  }, [currentBooking]);
  
  if (!currentBooking) {
    return null;
  }
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h1>
          <p className="text-gray-600">Your meal has been booked successfully</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-medium mb-4 pb-3 border-b">Booking Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-medium">{currentBooking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meal Type</span>
              <span className="font-medium">{currentBooking.mealCategory.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">{currentBooking.displayDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">₹{currentBooking.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium capitalize">{currentBooking.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600">Confirmed</span>
            </div>
          </div>
        </div>
        
        <div className="bg-corporate-50 rounded-lg p-4 mb-6 border border-corporate-100">
          <p className="text-sm text-corporate-800">
            Please use your RFID card at the cafeteria counter to avail your meal.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            className="bg-corporate-600 hover:bg-corporate-700"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ConfirmationPage;
