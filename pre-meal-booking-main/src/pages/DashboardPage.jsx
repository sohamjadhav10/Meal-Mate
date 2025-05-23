
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/PageContainer';

// Sample test data for development purposes
const sampleUserData = {
  id: 'EMP12345',
  name: 'John Smith',
  email: 'john.smith@example.com',
  walletBalance: 1250,
  rfidCardId: 'RFID987654321'
};

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const { getAvailableDates, getMealCategories } = useBooking();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const navigate = useNavigate();
  
  // Use sample data if no user is available (for testing purposes)
  const userData = user || sampleUserData;
  
  const availableDates = getAvailableDates();
  const mealCategories = getMealCategories();
  
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleMealSelect = (meal) => {
    setSelectedMeal(meal);
    navigate(`/booking?date=${selectedDate.formatted}&mealId=${meal.id}`);
  };

  // If user data is still loading, show a loading state
  if (loading) {
    return (
      <PageContainer>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corporate-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pre-Meal Booking</h1>
          <p className="text-gray-600 mt-2">
            Book your meals in advance for the next three days
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Select Date</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <Button
                    key={date.formatted}
                    variant={selectedDate?.formatted === date.formatted ? "default" : "outline"}
                    className={`h-auto py-3 justify-start ${
                      selectedDate?.formatted === date.formatted 
                        ? 'bg-corporate-600 hover:bg-corporate-700 text-white'
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{date.display}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-corporate-50 p-4 rounded-lg border border-corporate-100">
              <h3 className="text-sm font-medium text-corporate-900 mb-2">Wallet Balance</h3>
              <div className="text-2xl font-bold text-corporate-700">
                ₹{userData?.walletBalance ?? 0}
              </div>
              <p className="text-xs text-corporate-600 mt-1">Available for payments</p>
            </div>
          </div>
        </div>
        
        {selectedDate && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Available Meals for {selectedDate.display}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {mealCategories.map((meal) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-corporate-50 pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <span>{meal.name}</span>
                      <Badge variant="outline" className="ml-2 bg-white">₹{meal.price}</Badge>
                    </CardTitle>
                    <CardDescription>{meal.availableTime}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {meal.items.map((item) => (
                        <li key={item.id} className="text-sm">
                          <span className="font-medium">{item.name}</span>
                          <p className="text-gray-500 text-xs">{item.description}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <Button 
                      className="w-full bg-corporate-600 hover:bg-corporate-700"
                      onClick={() => handleMealSelect(meal)}
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
