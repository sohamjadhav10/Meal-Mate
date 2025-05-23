
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import { BarChart, LineChart, PieChart, AreaChart } from 'recharts';
import { Bar, Line, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { getAllBookings, getMealCategories } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterMealType, setFilterMealType] = useState('all');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const navigate = useNavigate();
  
  const mealCategories = getMealCategories();
  
  const applyFilters = useCallback(() => {
    let filtered = [...bookings];
    
    if (filterDate) {
      filtered = filtered.filter(booking => booking.date === filterDate);
    }
    
    if (filterMealType && filterMealType !== 'all') {
      filtered = filtered.filter(booking => booking.mealCategory.id === filterMealType);
    }
    
    if (filterEmployeeId) {
      const query = filterEmployeeId.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.employeeId.toLowerCase().includes(query) || 
        booking.employeeName.toLowerCase().includes(query)
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, filterDate, filterMealType, filterEmployeeId]);
  
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);
  
  useEffect(() => {
    if (!user || !isAdmin) {
        navigate('/');
        return;
    }
}, [user, isAdmin, navigate]);

useEffect(() => {
    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/bookings/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setBookings(data.bookings);
                setFilteredBookings(data.bookings);
            } else {
                toast.error(data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to fetch bookings');
        }
    };
    if (isAdmin && user?.token) {
        fetchBookings();
    }
}, [isAdmin, user?.token]);
  
  const resetFilters = () => {
    setFilterDate('');
    setFilterMealType('all');
    setFilterEmployeeId('');
  };
  
  const exportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = [
      'Booking ID',
      'Employee ID',
      'Employee Name',
      'Date',
      'Meal Type',
      'Amount',
      'Payment Method',
      'Status',
      'Availed'
    ].join(',');
    
    const csvData = filteredBookings.map(booking => {
      return [
        booking.id,
        booking.employeeId,
        booking.employeeName,
        booking.date,
        booking.mealCategory.name,
        booking.amount,
        booking.paymentMethod,
        booking.status,
        booking.availed ? 'Yes' : 'No'
      ].join(',');
    }).join('\n');
    
    const csv = `${headers}\n${csvData}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('CSV exported successfully');
  };
  
  // Mock data for charts
  const getMealTypeData = () => {
    const counts = {};
    mealCategories.forEach(category => {
      counts[category.id] = 0;
    });
    
    bookings.forEach(booking => {
      counts[booking.mealCategory.id] = (counts[booking.mealCategory.id] || 0) + 1;
    });
    
    return Object.keys(counts).map(key => ({
      name: mealCategories.find(c => c.id === key)?.name || key,
      count: counts[key]
    }));
  };
  
  const getPaymentMethodData = () => {
    const counts = { wallet: 0, upi: 0, payroll: 0 };
    
    bookings.forEach(booking => {
      counts[booking.paymentMethod] = (counts[booking.paymentMethod] || 0) + 1;
    });
    
    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: counts[key]
    }));
  };
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor meal bookings
          </p>
        </div>
        
        <Tabs defaultValue="bookings" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  View and manage all meal bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Filter by Date</label>
                      <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Filter by Meal Type</label>
                      <Select value={filterMealType} onValueChange={setFilterMealType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Meal Types</SelectItem>
                          {mealCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Filter by Employee</label>
                      <Input
                        type="text"
                        placeholder="Employee ID or Name"
                        value={filterEmployeeId}
                        onChange={(e) => setFilterEmployeeId(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <Button variant="outline" onClick={exportCSV}>
                      Export CSV
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meal Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Availed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <tr key={booking._id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-corporate-700">
                              {booking._id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{booking.employeeName}</div>
                              <div className="text-xs text-gray-400">{booking.employeeId}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(booking.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.mealCategory.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{booking.amount}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {booking.paymentMethod}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {booking.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {booking.isAvailed ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500">
                            No bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Meal Type</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMealTypeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#0072c4" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPaymentMethodData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getPaymentMethodData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0072c4', '#36adf5', '#bae0fd'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;
