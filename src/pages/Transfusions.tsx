import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  Droplet, 
  FileText, 
  Hospital, 
  Loader2, 
  Search, 
  UserCheck,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Transfusions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    transfusions, 
    inventory, 
    recipients, 
    findMatchingDonors, 
    getRecipientById,
    updateTransfusionStatus,
    updateInventoryStatus,
    getDonorById,
    updateDonor,
    refreshData
  } = useBloodBank();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedTransfusion, setSelectedTransfusion] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "outline"; // Using outline instead of warning
      case "Completed":
        return "default"; // Default variant for completed
      case "Failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Completed":
        return <UserCheck className="h-4 w-4" />;
      case "Failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Loader2 className="h-4 w-4" />;
    }
  };

  const filteredTransfusions = transfusions.filter(
    (transfusion) => {
      const recipient = getRecipientById(transfusion.recipientId);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        transfusion.id.toLowerCase().includes(searchLower) ||
        (recipient?.name.toLowerCase().includes(searchLower)) ||
        transfusion.bloodType.toLowerCase().includes(searchLower) ||
        transfusion.status.toLowerCase().includes(searchLower)
      );
    }
  );
  
  const openStatusDialog = (transfusionId: string) => {
    setSelectedTransfusion(transfusionId);
    setStatusNotes("");
    setShowStatusDialog(true);
  };
  
  const handleUpdateStatus = async (status: 'Completed' | 'Failed') => {
    if (!selectedTransfusion) return;
    
    try {
      // Get the transfusion details
      const transfusion = transfusions.find(t => t.id === selectedTransfusion);
      if (!transfusion) return;
      
      // Update the transfusion status
      updateTransfusionStatus(selectedTransfusion, status, statusNotes);
      
      // Handle the specific status actions
      if (status === 'Completed') {
        // Mark inventory as used
        updateInventoryStatus(transfusion.inventoryId, 'Used');
        
        // Reset donor donation count if necessary
        const donor = getDonorById(transfusion.donorId);
        if (donor) {
          updateDonor(donor.id, { donationCount: 0 });
        }
        
        toast({
          title: "Transfusion Completed",
          description: "The transfusion has been marked as successful.",
          variant: "default"
        });
        
        // Refresh data to update the UI
        await refreshData();
      } else if (status === 'Failed') {
        toast({
          title: "Transfusion Failed",
          description: "The transfusion has been marked as failed. Redirecting to find new donors...",
          variant: "destructive"
        });
        
        // Refresh data to update the UI
        await refreshData();
        
        // Redirect to the recipients page after a short delay
        setTimeout(() => {
          navigate('/recipients');
        }, 1500);
      }
      
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error updating transfusion status:", error);
      toast({
        title: "Error",
        description: "Failed to update transfusion status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transfusions</h1>
          <p className="text-muted-foreground">Manage blood transfusions</p>
        </div>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transfusions..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredTransfusions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No transfusions found</p>
              <p className="text-muted-foreground">No transfusions match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransfusions.map((transfusion) => {
            const recipient = getRecipientById(transfusion.recipientId);
            
            return (
              <Card key={transfusion.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Droplet className="h-5 w-5 text-bloodlink-red" />
                      <span>Transfusion #{transfusion.id}</span>
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(transfusion.status)} className="flex items-center gap-1">
                      {getStatusIcon(transfusion.status)}
                      <span>{transfusion.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <UserCheck className="h-4 w-4 text-slate-500" />
                        Recipient Information
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm">Name: {recipient?.name}</p>
                        <p className="text-sm">Blood Type: {transfusion.bloodType}</p>
                        <p className="text-sm">Urgency: {recipient?.urgencyLevel}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Hospital className="h-4 w-4 text-slate-500" />
                        Transfusion Details
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm">Date: {format(new Date(transfusion.date), 'MMM d, yyyy')}</p>
                        <p className="text-sm">Hospital: {transfusion.hospitalName}</p>
                        <p className="text-sm">Doctor: {transfusion.doctorName}</p>
                        <p className="text-sm">Quantity: {transfusion.quantity}ml</p>
                      </div>
                    </div>
                  </div>
                  
                  {transfusion.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-md">
                      <h3 className="font-medium mb-1 flex items-center gap-1">
                        <FileText className="h-4 w-4 text-slate-500" />
                        Notes
                      </h3>
                      <p className="text-sm whitespace-pre-line">{transfusion.notes}</p>
                    </div>
                  )}
                  
                  {/* Only show update button for pending transfusions */}
                  {transfusion.status === 'Pending' && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => openStatusDialog(transfusion.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Update Status
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Transfusion Status</DialogTitle>
            <DialogDescription>
              Mark the transfusion as completed or failed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="notes" className="mb-2 block">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Add any additional notes about the status change"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="mb-4"
            />
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button 
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateStatus('Completed')}
              >
                <CheckCircle className="h-4 w-4" />
                Successful
              </Button>
              
              <Button 
                variant="destructive"
                className="flex items-center justify-center gap-2"
                onClick={() => handleUpdateStatus('Failed')}
              >
                <XCircle className="h-4 w-4" />
                Failed
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transfusions;
