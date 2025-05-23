
import { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import PageContainer from '@/components/PageContainer';

const RfidScannerPage = () => {
  const [rfidInput, setRfidInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const { checkBookingByRfid, getMealCategories } = useBooking();
  const mealCategories = getMealCategories();
  
  const handleScan = () => {
    if (!rfidInput.trim()) {
      toast.error('Please enter an RFID card ID');
      return;
    }
    
    if (!selectedMeal) {
      toast.error('Please select a meal type');
      return;
    }
    
    setIsScanning(true);
    
    // Simulate a slight delay for the scan process
    setTimeout(() => {
      const result = checkBookingByRfid(rfidInput, selectedMeal);
      setScanResult(result);
      setIsScanning(false);
      
      if (result.success) {
        toast.success('Meal approved');
      } else {
        toast.error(result.message);
      }
    }, 800);
  };
  
  const resetScan = () => {
    setRfidInput('');
    setScanResult(null);
  };
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Meal Avail Counter</h1>
          <p className="text-gray-600 mt-2">
            Scan RFID card to verify meal booking
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>RFID Scanner</CardTitle>
            <CardDescription>
              Enter RFID card ID to check booking status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Meal Type</label>
              <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">RFID Card ID</label>
              <Input
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Enter RFID card ID"
                className="text-center font-mono text-lg"
                disabled={isScanning}
              />
              <p className="text-xs text-gray-500">
                Simulating input from an RFID reader device
              </p>
            </div>
            
            {scanResult && (
              <div className={`mt-6 p-4 rounded-lg ${
                scanResult.success 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-red-50 border border-red-100'
              }`}>
                <div className="flex items-center">
                  {scanResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500 mr-2" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      scanResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {scanResult.success ? 'Meal Approved' : 'Access Denied'}
                    </h3>
                    <p className="text-sm mt-1">
                      {scanResult.message}
                    </p>
                  </div>
                </div>
                
                {scanResult.success && scanResult.booking && (
                  <div className="mt-3 pt-3 border-t border-green-200 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-green-700">Employee:</div>
                      <div>{scanResult.booking.employeeName}</div>
                      <div className="text-green-700">Meal:</div>
                      <div>{scanResult.booking.mealCategory.name}</div>
                      <div className="text-green-700">Booking ID:</div>
                      <div>{scanResult.booking.id}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={resetScan}
              disabled={isScanning || !scanResult}
            >
              Reset
            </Button>
            <Button 
              className="bg-corporate-600 hover:bg-corporate-700"
              onClick={handleScan}
              disabled={isScanning || !rfidInput.trim() || !selectedMeal}
            >
              {isScanning ? 'Scanning...' : 'Scan RFID'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* For demonstration purposes */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border text-sm">
          <p className="font-medium mb-2">Test RFID Cards:</p>
          <p className="mb-1">For testing, you can use:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>RFID-12345 (with a booking)</li>
            <li>ADMIN-RFID-123 (admin card)</li>
            <li>Make a booking and use the RFID assigned to your account</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
};

export default RfidScannerPage;
