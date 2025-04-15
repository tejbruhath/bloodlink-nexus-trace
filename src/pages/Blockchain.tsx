
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, FileCheck, Clock, FileX, Search, Droplet, User, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Blockchain = () => {
  const { blockchain, verifyDonorId } = useBloodBank();
  const [donorId, setDonorId] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    donation?: {
      donorName: string;
      bloodType: string;
      date: string;
      status: string;
    };
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyDonorId = async () => {
    if (!donorId.trim()) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyDonorId(donorId);
      console.log("Verification result:", result);
      setVerificationResult(result);
    } catch (error) {
      console.error("Error during verification:", error);
      setVerificationResult({ found: false });
    } finally {
      setIsVerifying(false);
    }
  };

  // Filter blockchain records by status for tabs
  const validRecords = blockchain.filter(record => record.status === "Valid");
  const pendingRecords = blockchain.filter(record => record.status === "Pending");
  const invalidRecords = blockchain.filter(record => record.status === "Invalid");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Blockchain Verification</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Verify Donor ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter donor ID (e.g., d001)"
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button onClick={handleVerifyDonorId} disabled={isVerifying}>
                {isVerifying ? (
                  <LoadingSpinner size={16} className="mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Verify
              </Button>
            </div>
            
            {verificationResult && (
              <Alert variant={verificationResult.found ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {verificationResult.found ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {verificationResult.found ? "Donor Found" : "Donor Not Found"}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  {verificationResult.found ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {verificationResult.donation?.donorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-bloodlink-red" />
                        <span className="text-sm">
                          Blood Type: {verificationResult.donation?.bloodType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Date: {verificationResult.donation?.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Status: {verificationResult.donation?.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    "No donor found with this ID. Please check the ID and try again."
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="valid">Valid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="invalid">Invalid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Valid Transactions</span>
                  </div>
                  <p className="text-2xl font-bold">{validRecords.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-medium">Pending Verification</span>
                  </div>
                  <p className="text-2xl font-bold">{pendingRecords.length}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileX className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium">Invalid Transactions</span>
                  </div>
                  <p className="text-2xl font-bold">{invalidRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Blockchain Records */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Blockchain Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockchain.slice(0, 5).map((record) => (
                  <div 
                    key={record.blockId} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          {record.status === "Valid" ? (
                            <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                          ) : record.status === "Pending" ? (
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                          ) : (
                            <FileX className="h-4 w-4 mr-2 text-red-500" />
                          )}
                          <span className="font-medium">Block #{record.blockId}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Type: {record.transactionType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Timestamp: {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        record.status === "Valid" 
                          ? "bg-green-100 text-green-800" 
                          : record.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="valid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valid Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validRecords.length > 0 ? (
                  validRecords.map((record) => (
                    <div 
                      key={record.blockId} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">Block #{record.blockId}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Type: {record.transactionType}
                          </div>
                          <div className="text-sm text-gray-500">
                            Timestamp: {new Date(record.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Valid
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No valid blockchain records found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRecords.length > 0 ? (
                  pendingRecords.map((record) => (
                    <div 
                      key={record.blockId} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            <span className="font-medium">Block #{record.blockId}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Type: {record.transactionType}
                          </div>
                          <div className="text-sm text-gray-500">
                            Timestamp: {new Date(record.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Pending
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No pending blockchain records found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invalid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invalidRecords.length > 0 ? (
                  invalidRecords.map((record) => (
                    <div 
                      key={record.blockId} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-1">
                            <FileX className="h-4 w-4 mr-2 text-red-500" />
                            <span className="font-medium">Block #{record.blockId}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Type: {record.transactionType}
                          </div>
                          <div className="text-sm text-gray-500">
                            Timestamp: {new Date(record.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Invalid
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No invalid blockchain records found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Blockchain;
