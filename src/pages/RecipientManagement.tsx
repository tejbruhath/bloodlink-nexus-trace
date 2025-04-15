import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { Recipient, BloodType, RhFactor, UrgencyLevel, Inventory } from "@/lib/types";
import { 
  AlertCircle, 
  Droplet, 
  HeartPulse, 
  Hospital, 
  Plus, 
  Search, 
  User, 
  Users,
  MapPin,
  Navigation,
  Compass,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { DonorContactCard } from "@/components/donor/DonorContactCard";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function RecipientManagement() {
  const { recipients, addRecipient, inventory, findMatchingDonors, findClosestDonors, addTransfusion, donors } = useBloodBank();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddRecipientDialog, setShowAddRecipientDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [matchedInventory, setMatchedInventory] = useState<Inventory[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  
  const [newRecipient, setNewRecipient] = useState<Partial<Recipient>>({
    name: "",
    bloodType: "O+" as BloodType,
    rhFactor: "Positive" as RhFactor,
    contactNumber: "",
    email: "",
    dateOfBirth: "",
    address: "",
    latitude: 40.7128, // Default coordinates (NYC)
    longitude: -74.0060,
    urgencyLevel: "Medium" as UrgencyLevel,
    medicalCondition: "",
    hospitalName: "",
    doctorName: "",
    doctorContact: "",
  });

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(search.toLowerCase()) ||
      recipient.bloodType.toLowerCase().includes(search.toLowerCase()) ||
      recipient.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      recipient.urgencyLevel.toLowerCase().includes(search.toLowerCase())
  );

  // Mock geocoding function - In a real application, you would use a real geocoding API
  const geocodeAddress = async (address: string): Promise<{latitude: number, longitude: number}> => {
    setIsGeocodingAddress(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate random coordinates near NYC for demonstration
    // In production, you would call a real geocoding API here
    const randomLat = 40.7128 + (Math.random() - 0.5) * 0.1;
    const randomLng = -74.0060 + (Math.random() - 0.5) * 0.1;
    
    setIsGeocodingAddress(false);
    
    return {
      latitude: randomLat,
      longitude: randomLng
    };
  };

  const handleAddressChange = (address: string) => {
    setNewRecipient({
      ...newRecipient,
      address
    });
  };

  const handleGeocodeAddress = async () => {
    if (!newRecipient.address) {
      toast({
        title: "Address Required",
        description: "Please enter an address to geocode",
        variant: "destructive"
      });
      return;
    }

    try {
      const { latitude, longitude } = await geocodeAddress(newRecipient.address);
      
      setNewRecipient({
        ...newRecipient,
        latitude,
        longitude
      });
      
      toast({
        title: "Location Updated",
        description: `Coordinates set to [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`,
      });
    } catch (error) {
      toast({
        title: "Geocoding Failed",
        description: "Could not convert address to coordinates",
        variant: "destructive"
      });
    }
  };

  const handleAddRecipient = () => {
    if (
      !newRecipient.name ||
      !newRecipient.bloodType ||
      !newRecipient.rhFactor ||
      !newRecipient.contactNumber ||
      !newRecipient.email ||
      !newRecipient.dateOfBirth ||
      !newRecipient.address ||
      !newRecipient.urgencyLevel ||
      !newRecipient.hospitalName ||
      !newRecipient.doctorName ||
      !newRecipient.doctorContact
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    addRecipient(newRecipient as any);
    setNewRecipient({
      name: "",
      bloodType: "O+" as BloodType,
      rhFactor: "Positive" as RhFactor,
      contactNumber: "",
      email: "",
      dateOfBirth: "",
      address: "",
      latitude: 40.7128,
      longitude: -74.0060,
      urgencyLevel: "Medium" as UrgencyLevel,
      medicalCondition: "",
      hospitalName: "",
      doctorName: "",
      doctorContact: "",
    });
    setShowAddRecipientDialog(false);
    
    toast({
      title: "Recipient Added",
      description: "The recipient has been successfully added.",
    });
  };

  const findMatches = async (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    
    // Use coordinates for KNN matching if available
    if (recipient.latitude && recipient.longitude) {
      try {
        toast({
          title: "Searching",
          description: `Finding donors near coordinates [${recipient.latitude.toFixed(4)}, ${recipient.longitude.toFixed(4)}]`,
        });
        
        // Store the recipient's coordinates in the blood_requests table
        // This will happen automatically when the request is created
        
        // First find closest donors using KNN with improved distance calculation
        const closestDonors = await findClosestDonors(
          recipient.bloodType,
          recipient.latitude,
          recipient.longitude,
          15  // Increased from 10 to provide more options
        );
        
        // Then get matching inventory based on the donor IDs
        const donorIds = closestDonors.map(donor => donor.id);
        const nearbyInventory = inventory.filter(item => 
          donorIds.includes(item.donorId) && item.status === 'Available'
        );
        
        // Calculate actual distances for each inventory item for better sorting
        const inventoryWithDistance = nearbyInventory.map(item => {
          const donor = donors.find(d => d.id === item.donorId);
          let distance = null;
          
          if (donor?.latitude && donor?.longitude && recipient.latitude && recipient.longitude) {
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in km
            const lat1 = recipient.latitude * Math.PI / 180;
            const lat2 = donor.latitude * Math.PI / 180;
            const deltaLat = (donor.latitude - recipient.latitude) * Math.PI / 180;
            const deltaLon = (donor.longitude - recipient.longitude) * Math.PI / 180;
            
            const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                     Math.cos(lat1) * Math.cos(lat2) *
                     Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance = R * c;
          }
          
          return {
            ...item,
            distance: distance,
            donor: donor
          };
        });
        
        // Sort by distance (if available) and then by blood compatibility
        const sortedInventory = inventoryWithDistance.sort((a, b) => {
          // First sort by blood type compatibility (O- is universal donor)
          if (a.bloodType === 'O-' && b.bloodType !== 'O-') return -1;
          if (a.bloodType !== 'O-' && b.bloodType === 'O-') return 1;
          
          // Then sort by exact blood type match
          if (a.bloodType === recipient.bloodType && b.bloodType !== recipient.bloodType) return -1;
          if (a.bloodType !== recipient.bloodType && b.bloodType === recipient.bloodType) return 1;
          
          // Then sort by distance if available
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          
          // Finally sort by freshness (more recent donations first)
          return new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime();
        });
        
        // If we have nearby inventory use it, otherwise fall back to regular matching
        if (sortedInventory.length > 0) {
          setMatchedInventory(sortedInventory);
          toast({
            title: "Match Results",
            description: `Found ${sortedInventory.length} nearby compatible blood units`,
          });
        } else {
          const matches = findMatchingDonors(
            recipient.bloodType, 
            recipient.urgencyLevel,
            recipient.latitude,
            recipient.longitude
          );
          setMatchedInventory(matches);
          toast({
            title: "Match Results",
            description: `Found ${matches.length} compatible blood units`,
          });
        }
      } catch (error) {
        console.error("Error finding closest donors:", error);
        // Fallback to standard matching
        const matches = findMatchingDonors(recipient.bloodType, recipient.urgencyLevel);
        setMatchedInventory(matches);
        toast({
          title: "Location Search Failed",
          description: "Falling back to standard matching based on blood type only",
          variant: "destructive"
        });
      }
    } else {
      // Use standard matching if no coordinates are available
      const matches = findMatchingDonors(recipient.bloodType, recipient.urgencyLevel);
      setMatchedInventory(matches);
      toast({
        title: "Match Results",
        description: `Found ${matches.length} compatible blood units (no location data used)`,
      });
    }
    
    setShowMatchDialog(true);
  };

  const handleSelectInventory = (inventoryId: string) => {
    setSelectedInventoryId(inventoryId);
  };

  const handleCreateTransfusion = () => {
    if (!selectedRecipient || !selectedInventoryId) return;

    const selectedInventory = inventory.find(item => item.id === selectedInventoryId);
    if (!selectedInventory) return;

    // Create the transfusion with location data if available
    addTransfusion({
      recipientId: selectedRecipient.id,
      inventoryId: selectedInventoryId,
      donorId: selectedInventory.donorId,
      bloodType: selectedInventory.bloodType,
      rhFactor: selectedInventory.rhFactor,
      quantity: selectedInventory.quantity,
      date: new Date().toISOString().split('T')[0],
      hospitalName: selectedRecipient.hospitalName,
      doctorName: selectedRecipient.doctorName,
      status: 'Pending',
      notes: '',
      // Include location data for the blood request
      latitude: selectedRecipient.latitude,
      longitude: selectedRecipient.longitude
    });

    setShowMatchDialog(false);
    setSelectedRecipient(null);
    setSelectedInventoryId(null);
    
    toast({
      title: "Transfusion Scheduled",
      description: "The blood transfusion has been scheduled successfully.",
    });
  };

  const getAgeFromDOB = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "Critical":
        return <Badge className="bg-urgency-high">Critical</Badge>;
      case "High":
        return <Badge className="bg-urgency-high/80">High</Badge>;
      case "Medium":
        return <Badge className="bg-urgency-medium">Medium</Badge>;
      case "Low":
        return <Badge className="bg-status-valid">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipient Management</h1>
          <p className="text-muted-foreground">Register and manage blood recipients</p>
        </div>
        <Dialog open={showAddRecipientDialog} onOpenChange={setShowAddRecipientDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add New Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Recipient</DialogTitle>
              <DialogDescription>Register a new blood recipient in the system</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newRecipient.name}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newRecipient.dateOfBirth}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={newRecipient.bloodType}
                    onValueChange={(value) =>
                      setNewRecipient({
                        ...newRecipient,
                        bloodType: value as BloodType,
                        rhFactor: value.includes("-") ? "Negative" : "Positive",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
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
                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    value={newRecipient.urgencyLevel}
                    onValueChange={(value) =>
                      setNewRecipient({ ...newRecipient, urgencyLevel: value as UrgencyLevel })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={newRecipient.contactNumber}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, contactNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, email: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="address"
                    value={newRecipient.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleGeocodeAddress}
                    disabled={isGeocodingAddress || !newRecipient.address}
                  >
                    {isGeocodingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={newRecipient.latitude}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, latitude: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={newRecipient.longitude}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, longitude: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              
              {newRecipient.latitude && newRecipient.longitude && (
                <div className="bg-slate-50 p-3 rounded-md flex items-center gap-2 text-sm">
                  <Compass className="h-4 w-4 text-slate-500" />
                  <span>
                    Coordinates set to [{newRecipient.latitude.toFixed(4)}, {newRecipient.longitude.toFixed(4)}].
                    KNN matching will use these coordinates.
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital</Label>
                  <Input
                    id="hospitalName"
                    value={newRecipient.hospitalName}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, hospitalName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalCondition">Medical Condition</Label>
                  <Input
                    id="medicalCondition"
                    value={newRecipient.medicalCondition}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, medicalCondition: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input
                    id="doctorName"
                    value={newRecipient.doctorName}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, doctorName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorContact">Doctor Contact</Label>
                  <Input
                    id="doctorContact"
                    value={newRecipient.doctorContact}
                    onChange={(e) =>
                      setNewRecipient({ ...newRecipient, doctorContact: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRecipientDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRecipient}>Add Recipient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recipients by name, blood type, or hospital..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Recipient Registry</CardTitle>
          <CardDescription>Manage and track blood recipients</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No recipients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-500" />
                        {recipient.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Droplet className={`h-4 w-4 ${
                          recipient.bloodType.includes('O') 
                            ? 'text-status-valid' 
                            : recipient.bloodType.includes('A') 
                              ? 'text-bloodlink-blue' 
                              : recipient.bloodType.includes('B') 
                                ? 'text-urgency-medium' 
                                : 'text-urgency-high'
                        }`} />
                        {recipient.bloodType}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUrgencyBadge(recipient.urgencyLevel)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Hospital className="h-4 w-4 text-slate-500" />
                        {recipient.hospitalName || "None"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(recipient.latitude && recipient.longitude) ? (
                        <div className="flex items-center gap-1">
                          <Navigation className="h-4 w-4 text-slate-500" />
                          {recipient.latitude.toFixed(4)}, {recipient.longitude.toFixed(4)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No coordinates</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8"
                        onClick={() => findMatches(recipient)}
                      >
                        Find Match
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compatible Blood Units</DialogTitle>
            <DialogDescription>
              Found {matchedInventory.length} compatible blood units for {selectedRecipient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-slate-50 rounded-md p-3 mb-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium">{selectedRecipient?.name}</span>
                </div>
                <Badge variant="outline" className={`${
                  selectedRecipient?.urgencyLevel === 'Critical' ? 'bg-urgency-high/10 text-urgency-high' :
                  selectedRecipient?.urgencyLevel === 'High' ? 'bg-urgency-medium/10 text-urgency-medium' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {selectedRecipient?.urgencyLevel} Priority
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Droplet className="h-4 w-4 text-bloodlink-red" />
                  <span className="text-xs">Blood Type: {selectedRecipient?.bloodType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Hospital className="h-4 w-4 text-slate-500" />
                  <span className="text-xs">Hospital: {selectedRecipient?.hospitalName}</span>
                </div>
                {selectedRecipient?.latitude && selectedRecipient?.longitude && (
                  <div className="flex items-center gap-1 col-span-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-xs">Location: {selectedRecipient.latitude.toFixed(4)}, {selectedRecipient.longitude.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {matchedInventory.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-medium">No compatible blood units found</p>
                  <p className="text-muted-foreground">
                    There are no available blood units compatible with this recipient's blood type.
                  </p>
                </div>
              ) : (
                matchedInventory.map((item) => {
                  const donor = donors.find(d => d.id === item.donorId);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedInventoryId === item.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-slate-50"
                      }`}
                      onClick={() => handleSelectInventory(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplet className={`h-5 w-5 ${
                            item.bloodType.includes('O') 
                              ? 'text-status-valid' 
                              : item.bloodType.includes('A') 
                                ? 'text-bloodlink-blue' 
                                : item.bloodType.includes('B') 
                                  ? 'text-urgency-medium' 
                                  : 'text-urgency-high'
                          }`} />
                          <span className="font-medium">Blood Unit #{item.id.substring(0, 6)}</span>
                        </div>
                        <Badge variant="outline">{item.bloodType}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-xs text-muted-foreground">Donation Date: {format(new Date(item.donationDate), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">Expiry Date: {format(new Date(item.expiryDate), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">Donor: {donor?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">Location: {item.location}</div>
                        {item.distance !== undefined && (
                          <div className="col-span-2 flex items-center gap-1">
                            <Navigation className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium">Distance: {item.distance.toFixed(2)} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedInventoryId || matchedInventory.length === 0}
              onClick={handleCreateTransfusion}
            >
              Schedule Transfusion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}