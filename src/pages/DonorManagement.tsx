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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { Donor, BloodType, RhFactor } from "@/lib/types";
import { 
  CheckCircle2, 
  Clock, 
  Copy,
  Droplet, 
  MapPin,
  Plus,
  Search, 
  UserCircle, 
  Calendar,
  ChevronDown,
  CornerDownLeft,
  Loader2,
  Check,
  UserPlus,
  BadgeCheck,
  Fingerprint,
  Mail,
  Phone
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageLoading } from "@/components/ui/loading-spinner";
import { DonorContactCard } from "@/components/donor/DonorContactCard";
import { NewDonorForm } from "@/components/donor/NewDonorForm";
import { Badge } from "@/components/ui/badge";

export default function DonorManagement() {
  const { donors, addDonor, addInventory, refreshData } = useBloodBank();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddDonorDialog, setShowAddDonorDialog] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [newDonorId, setNewDonorId] = useState<string>("");
  const [showDonorIdDialog, setShowDonorIdDialog] = useState(false);
  const [currentDonorId, setCurrentDonorId] = useState<string>("");
  const [newDonor, setNewDonor] = useState<Partial<Donor>>({
    name: "",
    bloodType: "O+" as BloodType,
    rhFactor: "Positive" as RhFactor,
    contactNumber: "",
    email: "",
    dateOfBirth: "",
    address: "",
    latitude: 0,
    longitude: 0,
    hasMedicalConditions: false,
    isSmoker: false,
    consumesAlcohol: false,
    consentGiven: false,
  });
  
  const [donation, setDonation] = useState({
    quantity: 450, // default is 450ml
    location: "Main Blood Bank",
  });

  const [currentContactDonor, setCurrentContactDonor] = useState<Donor | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredDonors = donors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(search.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(search.toLowerCase()) ||
      donor.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDonorCreated = (donorId: string) => {
    setNewDonorId(donorId);
    setShowAddDonorDialog(false);
    setShowSuccessDialog(true);
  };

  const handleCopyDonorId = (id: string = newDonorId) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied!",
      description: "Donor ID copied to clipboard",
    });
  };

  const showDonorId = (donorId: string) => {
    setCurrentDonorId(donorId);
    setShowDonorIdDialog(true);
  };

  const handleDonation = async () => {
    if (!selectedDonorId) return;
    
    const donor = donors.find(d => d.id === selectedDonorId);
    if (!donor) return;
    
    const inventory = await addInventory({
      donorId: selectedDonorId,
      bloodType: donor.bloodType,
      rhFactor: donor.rhFactor,
      donationDate: new Date().toISOString().split('T')[0],
      quantity: donation.quantity,
      status: 'Available', // The service layer will convert this to lowercase for the database
      location: donation.location,
    });
    
    if (inventory) {
      toast({
        title: "Success!",
        description: "Blood donation recorded successfully",
      });
      
      // Refresh the data to show the updated donation status
      await refreshData();
    }
    
    setShowDonationDialog(false);
    setSelectedDonorId(null);
    setDonation({
      quantity: 450,
      location: "Main Blood Bank",
    });
  };

  const openDonationDialog = (donorId: string) => {
    setSelectedDonorId(donorId);
    setShowDonationDialog(true);
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

  const getDonationStatus = (donor: Donor) => {
    if (!donor.lastDonationDate) {
      return (
        <Badge 
          variant="outline" 
          className="text-slate-500 border border-slate-200 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer px-3 py-1"
        >
          Never Donated
        </Badge>
      );
    }
    
    const lastDonation = new Date(donor.lastDonationDate);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 56) {
      return (
        <Badge 
          variant="outline" 
          className="text-amber-800 border border-amber-200 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer px-3 py-1"
        >
          Recent Donor
        </Badge>
      );
    } else {
      return (
        <Badge 
          variant="outline" 
          className="text-emerald-700 border border-emerald-200 bg-emerald-100 hover:bg-emerald-200 transition-colors cursor-pointer px-3 py-1"
        >
          Eligible
        </Badge>
      );
    }
  };

  // Fix inconsistency between donation count and last donation date
  const getConsistentDonationCount = (donor: Donor) => {
    // If the donor has never donated (no last donation date), the count should be 0
    if (!donor.lastDonationDate) {
      return 0;
    }
    
    // Otherwise, return the actual donation count
    return donor.donationCount;
  };

  const handleCopyField = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        toast({
          title: "Copied to clipboard",
          description: `${field} has been copied to your clipboard.`,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donor Management</h1>
          <p className="text-muted-foreground">
            Register and manage blood donors
          </p>
        </div>
        <Dialog open={showAddDonorDialog} onOpenChange={setShowAddDonorDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add New Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Donor</DialogTitle>
              <DialogDescription>
                Register a new blood donor in the system
              </DialogDescription>
            </DialogHeader>
            <NewDonorForm 
              onSuccess={handleDonorCreated}
              onCancel={() => setShowAddDonorDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search donors by name, blood type, or email..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Donor Registry</CardTitle>
            <CardDescription>
              Manage and track blood donors
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Donations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No donors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-bloodlink-blue" />
                          {donor.name}
                        </div>
                      </TableCell>
                      <TableCell>{getAgeFromDOB(donor.dateOfBirth)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Droplet className={`h-4 w-4 ${
                            donor.bloodType.includes('O') 
                              ? 'text-status-valid' 
                              : donor.bloodType.includes('A') 
                                ? 'text-bloodlink-blue' 
                                : donor.bloodType.includes('B') 
                                  ? 'text-urgency-medium' 
                                  : 'text-urgency-high'
                          }`} />
                          {donor.bloodType}
                        </div>
                      </TableCell>
                      <TableCell>
                        {donor.lastDonationDate ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(donor.lastDonationDate), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                          {getConsistentDonationCount(donor)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              // Show contact dialog instead of opening email
                              setCurrentContactDonor(donor);
                              setShowContactDialog(true);
                            }}
                          >
                            Contact
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => showDonorId(donor.id)}
                          >
                            <Fingerprint className="h-3.5 w-3.5 text-bloodlink-blue" />
                            Donor ID
                          </Button>
                          <div 
                            className="cursor-pointer" 
                            onClick={() => openDonationDialog(donor.id)}
                          >
                            {getDonationStatus(donor)}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Donor ID Dialog */}
      <Dialog open={showDonorIdDialog} onOpenChange={setShowDonorIdDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-bloodlink-blue" />
              Donor ID Information
            </DialogTitle>
            <DialogDescription>
              This unique ID can be used to verify blockchain records and blood donations.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-slate-50 rounded-md flex items-center justify-between border">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-bloodlink-blue" />
              <span className="font-mono text-lg font-semibold">{currentDonorId}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-2"
              onClick={() => handleCopyDonorId(currentDonorId)}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDonorIdDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Blood Donation</DialogTitle>
            <DialogDescription>
              Record a new blood donation from this donor
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Donation Quantity (ml)</Label>
              <Input
                id="quantity"
                type="number"
                value={donation.quantity}
                onChange={(e) => setDonation({ ...donation, quantity: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Standard donation is 450ml</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={donation.location}
                onChange={(e) => setDonation({ ...donation, location: e.target.value })}
              />
            </div>
            
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bloodlink-red/10">
                <Droplet className="h-5 w-5 text-bloodlink-red" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Donation Date
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDonation} className="bg-bloodlink-red hover:bg-bloodlink-red/90">
              Record Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Donor ID Information
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please save this donor ID for future reference. It can be used to verify donations and transfusions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 p-4 bg-slate-50 rounded-md flex items-center justify-between border">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-bloodlink-red" />
              <span className="font-mono text-lg font-semibold">{newDonorId}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-2"
              onClick={() => handleCopyDonorId()}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction>
              I've saved my donor ID
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Information Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-bloodlink-blue" />
              Contact Information
            </DialogTitle>
            <DialogDescription>
              Contact details for {currentContactDonor?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {currentContactDonor?.email && (
              <div className="p-3 bg-slate-50 rounded-md flex items-center justify-between border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{currentContactDonor.email}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2"
                  onClick={() => handleCopyField(currentContactDonor.email, "Email")}
                >
                  {copiedField === "Email" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
            {currentContactDonor?.contactNumber && (
              <div className="p-3 bg-slate-50 rounded-md flex items-center justify-between border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{currentContactDonor.contactNumber}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2"
                  onClick={() => handleCopyField(currentContactDonor.contactNumber, "Phone")}
                >
                  {copiedField === "Phone" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
            {currentContactDonor?.address && (
              <div className="p-3 bg-slate-50 rounded-md flex items-center justify-between border">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{currentContactDonor.address}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2"
                  onClick={() => handleCopyField(currentContactDonor.address, "Address")}
                >
                  {copiedField === "Address" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowContactDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
