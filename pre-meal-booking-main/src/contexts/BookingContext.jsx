
import { createContext, useContext, useState } from 'react';
import { toast } from '@/components/ui/sonner';

// Create a context for bookings
const BookingContext = createContext();

// Sample meal data
const MEAL_CATEGORIES = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    availableTime: '7:00 AM - 9:00 AM',
    price: 150,
    items: [
      { id: 'b1', name: 'Continental Breakfast', description: 'Croissant, bread, jam, butter, and coffee/tea' },
      { id: 'b2', name: 'American Breakfast', description: 'Eggs, bacon, toast, and coffee/tea' },
      { id: 'b3', name: 'South Indian Breakfast', description: 'Idli, vada, sambar, and coffee/tea' }
    ]
  },
  {
    id: 'lunch',
    name: 'Lunch',
    availableTime: '12:00 PM - 2:00 PM',
    price: 250,
    items: [
      { id: 'l1', name: 'Executive Lunch', description: 'Rice, dal, 2 sabzi, roti, salad, and dessert' },
      { id: 'l2', name: 'Light Lunch', description: 'Sandwich, soup, and salad' },
      { id: 'l3', name: 'Special Lunch', description: 'Chef\'s special with premium items' }
    ]
  },
  {
    id: 'snacks',
    name: 'Evening Snacks',
    availableTime: '4:00 PM - 5:30 PM',
    price: 100,
    items: [
      { id: 's1', name: 'Tea/Coffee with Cookies', description: 'Assorted cookies with your choice of beverage' },
      { id: 's2', name: 'Samosa & Tea', description: 'Fresh samosas with mint chutney and tea' },
      { id: 's3', name: 'Sandwich Platter', description: 'Assorted vegetarian sandwiches' }
    ]
  },
  {
    id: 'dinner',
    name: 'Dinner',
    availableTime: '7:00 PM - 9:00 PM',
    price: 250,
    items: [
      { id: 'd1', name: 'Regular Dinner', description: 'Rice, dal, sabzi, roti, and dessert' },
      { id: 'd2', name: 'Diet Dinner', description: 'Low-calorie balanced meal' },
      { id: 'd3', name: 'Special Dinner', description: 'Premium meal with extra items' }
    ]
  }
];

// Sample test booking data
const sampleBookings = [
  {
    id: 'BK-A12B34CD',
    employeeId: 'EMP12345',
    employeeName: 'John Smith',
    date: '2025-05-21',
    displayDate: 'May 21, 2025',
    mealCategory: MEAL_CATEGORIES[0], // Breakfast
    amount: 150,
    paymentMethod: 'wallet',
    status: 'confirmed',
    availed: false,
    rfidCardId: 'RFID987654321',
    createdAt: '2025-05-20T10:30:00Z'
  },
  {
    id: 'BK-E56F78GH',
    employeeId: 'EMP67890',
    employeeName: 'Jane Doe',
    date: '2025-05-21',
    displayDate: 'May 21, 2025',
    mealCategory: MEAL_CATEGORIES[1], // Lunch
    amount: 250,
    paymentMethod: 'upi',
    status: 'confirmed',
    availed: true,
    rfidCardId: 'RFID123456789',
    createdAt: '2025-05-20T09:15:00Z',
    availedAt: '2025-05-21T12:30:00Z'
  },
  {
    id: 'BK-I91J23KL',
    employeeId: 'EMP24680',
    employeeName: 'Robert Johnson',
    date: '2025-05-22',
    displayDate: 'May 22, 2025',
    mealCategory: MEAL_CATEGORIES[2], // Evening Snacks
    amount: 100,
    paymentMethod: 'payroll',
    status: 'confirmed',
    availed: false,
    rfidCardId: 'RFID246801357',
    createdAt: '2025-05-20T14:45:00Z'
  },
  {
    id: 'BK-M45N67OP',
    employeeId: 'EMP13579',
    employeeName: 'Maria Garcia',
    date: '2025-05-22',
    displayDate: 'May 22, 2025',
    mealCategory: MEAL_CATEGORIES[3], // Dinner
    amount: 250,
    paymentMethod: 'wallet',
    status: 'confirmed',
    availed: false,
    rfidCardId: 'RFID135792468',
    createdAt: '2025-05-20T16:20:00Z'
  },
  {
    id: 'BK-Q78R90ST',
    employeeId: 'EMP12345',
    employeeName: 'John Smith',
    date: '2025-05-22',
    displayDate: 'May 22, 2025',
    mealCategory: MEAL_CATEGORIES[1], // Lunch
    amount: 250,
    paymentMethod: 'wallet',
    status: 'confirmed',
    availed: false,
    rfidCardId: 'RFID987654321',
    createdAt: '2025-05-20T11:10:00Z'
  }
];

// Provider component for the booking context
export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(sampleBookings); // Initialize with sample bookings for testing
  const [currentBooking, setCurrentBooking] = useState(null);

  // Get next 3 days for booking
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dates.push({
        date: date,
        formatted: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  // Create a new booking
  const createBooking = (bookingData) => {
    // Check for duplicate booking
    const isDuplicate = bookings.some(booking => 
      booking.date === bookingData.date && 
      booking.mealCategory.id === bookingData.mealCategory.id &&
      booking.employeeId === bookingData.employeeId
    );

    if (isDuplicate) {
      toast.error('You already have a booking for this meal on this date');
      return { success: false, error: 'Duplicate booking' };
    }

    // Generate booking ID
    const bookingId = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const newBooking = {
      ...bookingData,
      id: bookingId,
      status: 'confirmed',
      availed: false,
      createdAt: new Date().toISOString()
    };

    setBookings([...bookings, newBooking]);
    setCurrentBooking(newBooking);
    toast.success('Booking created successfully');
    if (success) {
      navigate('/dashboard');
    }
    return { success: true, booking: newBooking };
  };

  // Get all meal categories
  const getMealCategories = () => {
    return MEAL_CATEGORIES;
  };

  // Get all bookings (for admin)
  const getAllBookings = () => {
    return bookings;
  };

  // Check booking by RFID
  const checkBookingByRfid = (rfidCardId, mealCategoryId) => {
    const today = new Date().toISOString().split('T')[0];
    
    const booking = bookings.find(booking => 
      booking.rfidCardId === rfidCardId && 
      booking.date === today &&
      booking.mealCategory.id === mealCategoryId
    );

    if (!booking) {
      return { 
        success: false, 
        message: 'No booking found for this RFID card today for this meal' 
      };
    }

    if (booking.availed) {
      return { 
        success: false, 
        message: 'Meal already availed for today' 
      };
    }

    // Mark booking as availed
    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return { ...b, availed: true, availedAt: new Date().toISOString() };
      }
      return b;
    });

    setBookings(updatedBookings);

    return { 
      success: true, 
      message: 'Meal approved', 
      booking 
    };
  };

  // Value to be provided by the context
  const value = {
    bookings,
    currentBooking,
    getAvailableDates,
    createBooking,
    getMealCategories,
    getAllBookings,
    checkBookingByRfid
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook for using the booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// if (paymentMethod === 'wallet') {
//   if (user.walletBalance < amount) {
//     return res.status(400).json({
//       success: false,
//       message: 'Insufficient wallet balance'
//     });
//   }

//   // Deduct from wallet
//   user.walletBalance -= amount;
// }
