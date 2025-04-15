import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BloodType, Donor } from "@/lib/types";
import { IndianCity, indianCities } from "@/lib/indianCities";
import { 
  trainKNNWithIndianDonors, 
  findNearestIndianDonors,
  findClosestCity,
  CityFinder,
  pushIndianDonorsToSupabase,
  checkIfIndianDonorsExist
} from "@/services/indianDataService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Map, Pin, Search, Users, Upload, Database, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DonorContactCard } from "@/components/donor/DonorContactCard";
import { supabase } from "@/integrations/supabase/client";
import { useBloodBank } from "@/contexts/BloodBankContext";

const IndianDonorsPage: React.FC = () => {
  const { toast } = useToast();
  const { refreshData } = useBloodBank();
  const [isTraining, setIsTraining] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [donorCount, setDonorCount] = useState(0);
  const [searchParams, setSearchParams] = useState({
    bloodType: "O+" as BloodType,
    latitude: "",
    longitude: "",
    k: "5"
  });
  const [nearestDonors, setNearestDonors] = useState<Donor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nearestCities, setNearestCities] = useState<(IndianCity & { distance?: number })[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  // Upload to Supabase states
  const [uploadCount, setUploadCount] = useState<number>(50);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasIndianDonors, setHasIndianDonors] = useState<boolean | null>(null);

  // Check if Indian donors exist in Supabase
  useEffect(() => {
    const checkDonors = async () => {
      const exist = await checkIfIndianDonorsExist();
      setHasIndianDonors(exist);
    };
    
    checkDonors();
  }, []);

  // Train the model when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsTraining(true);
      try {
        const count = await trainKNNWithIndianDonors();
        setDonorCount(count);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error training model:", error);
      } finally {
        setIsTraining(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For numeric inputs like latitude and longitude, validate before setting state
    if (name === 'latitude' || name === 'longitude') {
      // Allow empty values or valid numbers
      if (value === '' || !isNaN(parseFloat(value))) {
        setSearchParams(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // For other inputs, set the value directly
      setSearchParams(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleFindNearestDonors = async () => {
    if (!searchParams.latitude || !searchParams.longitude) return;

    setIsSearching(true);
    try {
      // Parse latitude and longitude with validation
      const lat = parseFloat(searchParams.latitude);
      const lng = parseFloat(searchParams.longitude);
      
      // Ensure values are valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        toast({
          title: "Invalid coordinates",
          description: "Please enter valid latitude and longitude values.",
          variant: "destructive"
        });
        setIsSearching(false);
        return;
      }

      const donors = findNearestIndianDonors(
        searchParams.bloodType,
        lat,
        lng,
        parseInt(searchParams.k)
      );

      setNearestDonors(donors);

      // Find nearest cities
      const cityFinder = new CityFinder();
      const cities = cityFinder.findClosestCities(
        lat,
        lng,
        5
      );
      setNearestCities(cities);
    } catch (error) {
      console.error("Error finding nearest donors:", error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching for donors.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const city = indianCities.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city.name);
      setSearchParams(prev => ({
        ...prev,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString()
      }));
    }
  };

  const handleUploadToSupabase = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Check Supabase connection first - using a simpler query
      const { error: testError } = await supabase
        .from('donors')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        toast({
          title: "Database connection failed",
          description: `Unable to connect to Supabase: ${testError.message}`,
          variant: "destructive"
        });
        setUploadProgress(0);
        setIsUploading(false);
        return;
      }
      
      console.log('Supabase connection successful');
      
      // Manual progress tracking instead of animation
      setUploadProgress(10);
      toast({
        title: "Preparing upload",
        description: "Generating Indian donor data...",
      });
      
      // Start the upload process
      const count = await pushIndianDonorsToSupabase(uploadCount);
      
      // Update progress based on actual results
      setUploadProgress(100);
      
      if (count > 0) {
        setHasIndianDonors(true);
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${count} Indian donors to Supabase.`
        });
        
        // Refresh data immediately to show the results
        const exist = await checkIfIndianDonorsExist();
        setHasIndianDonors(exist);
        
        // Refresh the global context data to update other components
        await refreshData();
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload donors to Supabase. Check the console for errors.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error uploading donors:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading donors. Check the console for details.",
        variant: "destructive"
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Indian Blood Donors Network</h1>

      {isTraining ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            <LoadingSpinner size={40} className="mb-4" />
            <p className="text-center">Training KNN model with Indian donor data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="donor-search">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="donor-search">
                <Users className="h-4 w-4 mr-2" />
                Find Donors
              </TabsTrigger>
              <TabsTrigger value="city-search">
                <Map className="h-4 w-4 mr-2" />
                Find Nearest City
              </TabsTrigger>
              <TabsTrigger value="upload-data">
                <Database className="h-4 w-4 mr-2" />
                Upload to Supabase
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donor-search">
              <Card>
                <CardHeader>
                  <CardTitle>Find Compatible Donors in India</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                    <div>
                      <Label htmlFor="bloodType" className="mb-2 block">Blood Type</Label>
                      <Select 
                        value={searchParams.bloodType} 
                        onValueChange={(value) => handleSelectChange('bloodType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="latitude" className="mb-2 block">Latitude</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        placeholder="e.g., 19.0760"
                        value={searchParams.latitude}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="longitude" className="mb-2 block">Longitude</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        placeholder="e.g., 72.8777"
                        value={searchParams.longitude}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="k" className="mb-2 block">Number of Donors</Label>
                      <Select 
                        value={searchParams.k} 
                        onValueChange={(value) => handleSelectChange('k', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Number of donors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <span className="text-sm text-gray-500 mr-2">
                      {isLoaded ? `KNN model trained with ${donorCount} Indian donors` : "KNN model not trained"}
                    </span>
                    <Button 
                      onClick={handleFindNearestDonors} 
                      disabled={isSearching || !searchParams.latitude || !searchParams.longitude}
                    >
                      {isSearching ? <LoadingSpinner size={16} className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Find Nearest Donors
                    </Button>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Select a major city:</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map(city => (
                        <Button 
                          key={city} 
                          variant={selectedCity === city ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleCitySelect(city)}
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {nearestDonors.length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-3">Nearest Compatible Donors</h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Blood Type</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>Distance (km)</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nearestDonors.map((donor) => (
                              <TableRow key={donor.id}>
                                <TableCell>{donor.name}</TableCell>
                                <TableCell>{donor.bloodType}</TableCell>
                                <TableCell className="max-w-xs truncate">{donor.address}</TableCell>
                                <TableCell>
                                  {donor.distance !== undefined ? donor.distance.toFixed(2) : "N/A"}
                                </TableCell>
                                <TableCell>
                                  <DonorContactCard 
                                    donor={{
                                      id: donor.id,
                                      name: donor.name,
                                      contactNumber: donor.contactNumber,
                                      email: donor.email,
                                      bloodType: donor.bloodType,
                                      // Additional fields might be available from API but not in our current model
                                      whatsapp: donor.contactNumber
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="city-search">
              <Card>
                <CardHeader>
                  <CardTitle>Find the Nearest Indian City</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div>
                      <Label htmlFor="latitude" className="mb-2 block">Latitude</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        placeholder="e.g., 19.0760"
                        value={searchParams.latitude}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="longitude" className="mb-2 block">Longitude</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        placeholder="e.g., 72.8777"
                        value={searchParams.longitude}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <Button 
                      onClick={handleFindNearestDonors} 
                      disabled={isSearching || !searchParams.latitude || !searchParams.longitude}
                    >
                      {isSearching ? <LoadingSpinner size={16} className="mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                      Find Nearest Cities
                    </Button>
                  </div>

                  {nearestCities.length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-3">Nearest Cities</h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>City</TableHead>
                              <TableHead>State</TableHead>
                              <TableHead>Distance (km)</TableHead>
                              <TableHead>Population</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nearestCities.map((city) => (
                              <TableRow key={city.name}>
                                <TableCell className="font-medium">{city.name}</TableCell>
                                <TableCell>{city.state}</TableCell>
                                <TableCell>
                                  {city.distance !== undefined ? city.distance.toFixed(2) : "N/A"}
                                </TableCell>
                                <TableCell>{city.population.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload-data">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Indian Donors to Supabase</CardTitle>
                  <CardDescription>
                    Generate and upload a dataset of Indian donors to your Supabase database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasIndianDonors === true ? (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Indian donors already in database</AlertTitle>
                      <AlertDescription>
                        We've detected that your Supabase database already contains Indian donors. Uploading more will add additional records.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div>
                      <Label htmlFor="donorCount" className="mb-2 block">Number of Donors to Generate</Label>
                      <Input
                        id="donorCount"
                        type="number"
                        min={10}
                        max={500}
                        value={uploadCount}
                        onChange={(e) => setUploadCount(parseInt(e.target.value))}
                        disabled={isUploading}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button 
                        onClick={handleUploadToSupabase} 
                        disabled={isUploading || uploadCount < 10}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <LoadingSpinner size={16} className="mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload to Supabase
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {uploadProgress < 100 ? 'Uploading donors...' : 'Upload complete!'}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <h3 className="text-md font-medium">What this will do:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Generate {uploadCount} realistic Indian donor profiles with names, contact details, and locations</li>
                      <li>Distribute donors across major Indian cities based on population</li>
                      <li>Add proper Indian contact information (phone numbers, emails, addresses)</li>
                      <li>Include social media profiles and emergency contacts</li>
                      <li>Upload all data to your connected Supabase database</li>
                    </ul>
                    
                    <div className="bg-muted p-4 rounded-md mt-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Note:</span> The generated data is fictional and meant for demonstration purposes only. In a real-world application, you would need proper consent and data privacy measures in place.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default IndianDonorsPage; 