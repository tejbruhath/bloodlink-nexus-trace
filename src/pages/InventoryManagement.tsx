
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { Inventory, InventoryStatus } from "@/lib/types";
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Droplet, 
  ListFilter, 
  Search, 
  UserCircle, 
  XCircle 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InventoryManagement() {
  const { inventory, donors, updateInventoryStatus, getDonorById } = useBloodBank();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const filteredInventory = inventory.filter((item) => {
    // Filter by status
    if (filter !== "all" && item.status !== filter) {
      return false;
    }
    
    // Filter by search term
    return (
      item.bloodType.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleStatusChange = (id: string, status: InventoryStatus) => {
    updateInventoryStatus(id, status);
  };

  const openVerifyDialog = (item: Inventory) => {
    setSelectedItem(item);
    setShowVerifyDialog(true);
    
    // Simulate blockchain verification
    setTimeout(() => {
      // This is a mockup - in a real system this would check the blockchain
      const isValid = item.status === 'Available' || item.status === 'Reserved';
      setVerificationResult({
        isValid,
        message: isValid 
          ? "Blood unit verified successfully on the blockchain" 
          : "Blood unit verification failed - record inconsistency detected"
      });
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-status-valid">Available</Badge>;
      case "Reserved":
        return <Badge className="bg-status-pending">Reserved</Badge>;
      case "Used":
        return <Badge variant="outline" className="text-muted-foreground">Used</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "Discarded":
        return <Badge variant="destructive">Discarded</Badge>;
      default:
        return null;
    }
  };

  const calculateExpiryProgress = (donationDate: string, expiryDate: string) => {
    const donation = new Date(donationDate);
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    // Standard shelf life is 42 days
    const totalDays = 42;
    const daysUsed = differenceInDays(now, donation);
    const daysLeft = differenceInDays(expiry, now);
    
    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, (daysUsed / totalDays) * 100));
    
    return {
      progress,
      daysLeft: Math.max(0, daysLeft),
      isExpiringSoon: daysLeft <= 7 && daysLeft > 0,
      isExpired: daysLeft <= 0
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Track and manage blood inventory
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Blood units in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-valid" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'Available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved Units</CardTitle>
            <Calendar className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'Reserved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting transfusion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-urgency-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => {
                const { isExpiringSoon } = calculateExpiryProgress(item.donationDate, item.expiryDate);
                return item.status === 'Available' && isExpiringSoon;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 7 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by blood type, location, or ID..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[180px] flex-none">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="border gap-1">
                <ListFilter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Discarded">Discarded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Blood Inventory</CardTitle>
            <CardDescription>
              Track blood units and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Donation Date</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const donor = getDonorById(item.donorId);
                    const { progress, daysLeft, isExpiringSoon, isExpired } = calculateExpiryProgress(
                      item.donationDate, 
                      item.expiryDate
                    );
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">
                          {item.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Droplet className={`h-4 w-4 ${
                              item.bloodType.includes('O') 
                                ? 'text-status-valid' 
                                : item.bloodType.includes('A') 
                                  ? 'text-bloodlink-blue' 
                                  : item.bloodType.includes('B') 
                                    ? 'text-urgency-medium' 
                                    : 'text-urgency-high'
                            }`} />
                            <span className="font-medium">{item.bloodType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {donor ? (
                            <div className="flex items-center gap-1">
                              <UserCircle className="h-4 w-4 text-muted-foreground" />
                              {donor.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(item.donationDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="space-y-1 w-32">
                            <div className="flex justify-between text-xs">
                              <span className={item.status === 'Expired' ? 'text-destructive' : ''}>
                                {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                              </span>
                              <span className={`${
                                isExpired 
                                  ? 'text-destructive' 
                                  : isExpiringSoon 
                                    ? 'text-urgency-medium' 
                                    : 'text-muted-foreground'
                              }`}>
                                {isExpired ? 'Expired' : `${daysLeft} days left`}
                              </span>
                            </div>
                            <Progress 
                              value={progress} 
                              className={`h-1.5 ${
                                progress > 80 
                                  ? 'bg-destructive/20' 
                                  : progress > 60 
                                    ? 'bg-urgency-medium/20' 
                                    : 'bg-muted'
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === 'Available' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleStatusChange(item.id, 'Reserved')}
                              >
                                Reserve
                              </Button>
                            )}
                            {item.status === 'Reserved' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleStatusChange(item.id, 'Available')}
                              >
                                Unreserve
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8"
                              onClick={() => openVerifyDialog(item)}
                            >
                              Verify
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Blockchain Verification</DialogTitle>
            <DialogDescription>
              Verify blood unit integrity using blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedItem && (
              <div className="mb-4 p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-bloodlink-red" />
                  <div>
                    <div className="font-medium">{selectedItem.bloodType} Blood Unit</div>
                    <div className="text-sm text-muted-foreground">ID: {selectedItem.id}</div>
                  </div>
                </div>
              </div>
            )}
            
            {verificationResult ? (
              <div className={`rounded-md p-4 ${
                verificationResult.isValid 
                  ? 'bg-status-valid/10 border border-status-valid' 
                  : 'bg-urgency-high/10 border border-urgency-high'
              }`}>
                <div className="flex items-start gap-3">
                  {verificationResult.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-status-valid" />
                  ) : (
                    <XCircle className="h-5 w-5 text-urgency-high" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold">
                      {verificationResult.isValid ? 'Verification Successful' : 'Verification Failed'}
                    </h4>
                    <p className="mt-1 text-sm">
                      {verificationResult.message}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium">Blockchain Entry:</span>
                        <code className="rounded bg-muted px-1.5 py-0.5">
                          0x7e3a9c2b8d4f0e1a5c6b...
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-primary"></div>
                <h3 className="font-medium">Verifying on blockchain...</h3>
                <p className="text-sm text-muted-foreground">
                  Checking blood unit authenticity and integrity
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowVerifyDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
