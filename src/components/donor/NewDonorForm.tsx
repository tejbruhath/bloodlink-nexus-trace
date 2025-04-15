import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { Donor, BloodType, RhFactor } from "@/lib/types";
import { Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface NewDonorFormProps {
  onSuccess?: (donorId: string) => void;
  onCancel?: () => void;
}

export function NewDonorForm({ onSuccess, onCancel }: NewDonorFormProps) {
  const { addDonor } = useBloodBank();
  const { toast } = useToast();
  
  const [newDonor, setNewDonor] = useState<Partial<Donor>>({
    name: "",
    bloodType: "O" as BloodType,
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

  const handleAddDonor = async () => {
    if (
      !newDonor.name ||
      !newDonor.bloodType ||
      !newDonor.rhFactor ||
      !newDonor.contactNumber ||
      !newDonor.email ||
      !newDonor.dateOfBirth ||
      !newDonor.address ||
      !newDonor.consentGiven
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and provide consent.",
        variant: "destructive"
      });
      return;
    }

    // Get coordinates if they're not provided
    if (!newDonor.latitude || !newDonor.longitude) {
      // Use a simple random offset for demonstration purposes
      // In a real application, you would use geocoding API
      const lat = 40.7128 + (Math.random() - 0.5) * 2; // Random offset around NYC
      const lng = -74.0060 + (Math.random() - 0.5) * 2;
      setNewDonor(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    }
    
    const donor = await addDonor(newDonor as any);
    if (donor) {
      toast({
        title: "Success!",
        description: "New donor registered successfully",
      });
      
      setNewDonor({
        name: "",
        bloodType: "O" as BloodType,
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
      
      if (onSuccess) {
        onSuccess(donor.id);
      }
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Full Name"
            value={newDonor.name}
            onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={newDonor.dateOfBirth}
            onChange={(e) => setNewDonor({ ...newDonor, dateOfBirth: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            value={newDonor.email}
            onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number</Label>
          <Input
            id="phone"
            placeholder="Contact Number"
            value={newDonor.contactNumber}
            onChange={(e) => setNewDonor({ ...newDonor, contactNumber: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            value={newDonor.bloodType}
            onValueChange={(value) => setNewDonor({ ...newDonor, bloodType: value as BloodType })}
          >
            <SelectTrigger id="bloodType">
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="AB">AB</SelectItem>
              <SelectItem value="O">O</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rhFactor">Rh Factor</Label>
          <Select
            value={newDonor.rhFactor}
            onValueChange={(value) => setNewDonor({ ...newDonor, rhFactor: value as RhFactor })}
          >
            <SelectTrigger id="rhFactor">
              <SelectValue placeholder="Select Rh factor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Positive">Positive (+)</SelectItem>
              <SelectItem value="Negative">Negative (-)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Full Address"
          value={newDonor.address}
          onChange={(e) => setNewDonor({ ...newDonor, address: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="Latitude"
            value={newDonor.latitude === 0 ? "" : newDonor.latitude}
            onChange={(e) => setNewDonor({ ...newDonor, latitude: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="Longitude"
            value={newDonor.longitude === 0 ? "" : newDonor.longitude}
            onChange={(e) => setNewDonor({ ...newDonor, longitude: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">Medical Information</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="conditions" 
              checked={newDonor.hasMedicalConditions} 
              onCheckedChange={(checked) => 
                setNewDonor({ ...newDonor, hasMedicalConditions: checked as boolean })
              }
            />
            <Label htmlFor="conditions">Has Medical Conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="smoker" 
              checked={newDonor.isSmoker} 
              onCheckedChange={(checked) => 
                setNewDonor({ ...newDonor, isSmoker: checked as boolean })
              }
            />
            <Label htmlFor="smoker">Is a Smoker</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="alcohol" 
              checked={newDonor.consumesAlcohol} 
              onCheckedChange={(checked) => 
                setNewDonor({ ...newDonor, consumesAlcohol: checked as boolean })
              }
            />
            <Label htmlFor="alcohol">Consumes Alcohol</Label>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="consent" 
          checked={newDonor.consentGiven} 
          onCheckedChange={(checked) => 
            setNewDonor({ ...newDonor, consentGiven: checked as boolean })
          }
          className="data-[state=checked]:bg-bloodlink-red"
        />
        <Label htmlFor="consent" className="font-medium">
          I consent to donate blood and allow my information to be stored
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleAddDonor} className="gap-1">
          <UserPlus className="h-4 w-4" />
          Register Donor
        </Button>
      </div>
    </div>
  );
}