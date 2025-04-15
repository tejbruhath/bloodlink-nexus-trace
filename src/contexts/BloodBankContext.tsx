import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Donor, 
  Recipient, 
  Inventory, 
  Transfusion, 
  BlockchainRecord,
  InventoryStats,
  BloodType,
  BloodTypeCompatibility
} from '@/lib/types';
import * as supabaseService from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { PageLoading } from '@/components/ui/loading-spinner';
import { useNotifications } from '@/contexts/NotificationContext';

const mockDonors: Donor[] = [
  {
    id: "d001",
    name: "John Doe",
    bloodType: "O+",
    rhFactor: "Positive",
    contactNumber: "555-1234",
    email: "john.doe@example.com",
    dateOfBirth: "1985-06-15",
    address: "123 Main St, Anytown",
    latitude: 40.7128,
    longitude: -74.0060,
    hasMedicalConditions: false,
    isSmoker: false,
    consumesAlcohol: true,
    lastDonationDate: "2023-03-10",
    donationCount: 5,
    consentGiven: true,
    createdAt: "2022-01-15T12:00:00Z",
    updatedAt: "2023-03-10T14:30:00Z"
  },
  {
    id: "d002",
    name: "Jane Smith",
    bloodType: "A-",
    rhFactor: "Negative",
    contactNumber: "555-5678",
    email: "jane.smith@example.com",
    dateOfBirth: "1990-11-22",
    address: "456 Oak Ave, Somewhere",
    latitude: 40.7282,
    longitude: -73.9942,
    hasMedicalConditions: false,
    isSmoker: false,
    consumesAlcohol: false,
    lastDonationDate: "2023-04-05",
    donationCount: 3,
    consentGiven: true,
    createdAt: "2022-02-10T09:15:00Z",
    updatedAt: "2023-04-05T11:45:00Z"
  },
  {
    id: "d003",
    name: "Robert Johnson",
    bloodType: "B+",
    rhFactor: "Positive",
    contactNumber: "555-9012",
    email: "robert.j@example.com",
    dateOfBirth: "1978-08-30",
    address: "789 Pine Rd, Elsewhere",
    latitude: 40.7589,
    longitude: -73.9851,
    hasMedicalConditions: true,
    isSmoker: true,
    consumesAlcohol: true,
    lastDonationDate: "2023-02-20",
    donationCount: 8,
    consentGiven: true,
    createdAt: "2021-11-05T16:20:00Z",
    updatedAt: "2023-02-20T10:10:00Z"
  }
];

const mockRecipients: Recipient[] = [
  {
    id: "r001",
    name: "Emily Wilson",
    bloodType: "AB+",
    rhFactor: "Positive",
    contactNumber: "555-3456",
    email: "emily.w@example.com",
    dateOfBirth: "1992-03-25",
    address: "101 Cedar St, Cityville",
    latitude: 40.7489,
    longitude: -73.9880,
    urgencyLevel: "Medium",
    medicalCondition: "Surgery scheduled",
    hospitalName: "General Hospital",
    doctorName: "Dr. Sarah Lee",
    doctorContact: "555-7890",
    createdAt: "2023-01-05T08:30:00Z",
    updatedAt: "2023-01-05T08:30:00Z"
  },
  {
    id: "r002",
    name: "Michael Brown",
    bloodType: "O-",
    rhFactor: "Negative",
    contactNumber: "555-6789",
    email: "michael.b@example.com",
    dateOfBirth: "1965-12-10",
    address: "202 Maple Dr, Townsville",
    latitude: 40.7820,
    longitude: -73.9739,
    urgencyLevel: "Critical",
    medicalCondition: "Trauma victim",
    hospitalName: "Emergency Medical Center",
    doctorName: "Dr. James Wilson",
    doctorContact: "555-2345",
    createdAt: "2023-03-15T19:45:00Z",
    updatedAt: "2023-03-15T19:45:00Z"
  }
];

const mockInventory: Inventory[] = [
  {
    id: "i001",
    donorId: "d001",
    bloodType: "O+",
    rhFactor: "Positive",
    donationDate: "2023-03-10",
    expiryDate: "2023-04-21",
    quantity: 450,
    status: "Available",
    location: "Main Blood Bank",
    createdAt: "2023-03-10T14:30:00Z",
    updatedAt: "2023-03-10T14:30:00Z"
  },
  {
    id: "i002",
    donorId: "d002",
    bloodType: "A-",
    rhFactor: "Negative",
    donationDate: "2023-04-05",
    expiryDate: "2023-05-17",
    quantity: 450,
    status: "Available",
    location: "Main Blood Bank",
    createdAt: "2023-04-05T11:45:00Z",
    updatedAt: "2023-04-05T11:45:00Z"
  },
  {
    id: "i003",
    donorId: "d003",
    bloodType: "B+",
    rhFactor: "Positive",
    donationDate: "2023-02-20",
    expiryDate: "2023-04-03",
    quantity: 450,
    status: "Reserved",
    location: "General Hospital",
    createdAt: "2023-02-20T10:10:00Z",
    updatedAt: "2023-03-25T15:20:00Z"
  }
];

const mockTransfusions: Transfusion[] = [
  {
    id: "t001",
    recipientId: "r001",
    inventoryId: "i003",
    donorId: "d003",
    bloodType: "B+",
    rhFactor: "Positive",
    date: "2023-03-26",
    quantity: 300,
    status: "Pending",
    notes: "Scheduled for surgery",
    hospitalName: "General Hospital",
    doctorName: "Dr. Sarah Lee",
    createdAt: "2023-03-25T15:20:00Z",
    updatedAt: "2023-03-25T15:20:00Z"
  }
];

const mockBlockchain: BlockchainRecord[] = [
  {
    blockId: "b001",
    transactionType: "Donation",
    donorId: "d001",
    inventoryId: "i001",
    previousBlockId: undefined,
    status: "Valid",
    data: {
      bloodType: "O+",
      quantity: 450,
      donationDate: "2023-03-10"
    },
    timestamp: "2023-03-10T14:30:00Z",
    hash: "0x123abc..."
  },
  {
    blockId: "b002",
    transactionType: "Donation",
    donorId: "d002",
    inventoryId: "i002",
    previousBlockId: "b001",
    status: "Valid",
    data: {
      bloodType: "A-",
      quantity: 450,
      donationDate: "2023-04-05"
    },
    timestamp: "2023-04-05T11:45:00Z",
    hash: "0x456def..."
  },
  {
    blockId: "b003",
    transactionType: "Donation",
    donorId: "d003",
    inventoryId: "i003",
    previousBlockId: "b002",
    status: "Valid",
    data: {
      bloodType: "B+",
      quantity: 450,
      donationDate: "2023-02-20"
    },
    timestamp: "2023-02-20T10:10:00Z",
    hash: "0x789ghi..."
  },
  {
    blockId: "b004",
    transactionType: "Transfusion",
    donorId: "d003",
    recipientId: "r001",
    inventoryId: "i003",
    transfusionId: "t001",
    previousBlockId: "b003",
    status: "Pending",
    data: {
      bloodType: "B+",
      quantity: 300,
      transfusionDate: "2023-03-26",
      hospital: "General Hospital"
    },
    timestamp: "2023-03-25T15:20:00Z",
    hash: "0xabcdef..."
  }
];

const mockInventoryStats: InventoryStats = {
  total: 3,
  byBloodType: {
    "A+": 0,
    "A-": 1,
    "B+": 1,
    "B-": 0,
    "AB+": 0,
    "AB-": 0,
    "O+": 1,
    "O-": 0
  },
  expiringWithin7Days: 1,
  criticalLevels: ["AB-", "O-"]
};

export const bloodTypeCompatibilityMatrix: BloodTypeCompatibility[] = [
  {
    donorType: "O-",
    canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-"]
  },
  {
    donorType: "O+",
    canDonateTo: ["O+", "A+", "B+", "AB+"],
    canReceiveFrom: ["O-", "O+"]
  },
  {
    donorType: "A-",
    canDonateTo: ["A-", "A+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "A-"]
  },
  {
    donorType: "A+",
    canDonateTo: ["A+", "AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+"]
  },
  {
    donorType: "B-",
    canDonateTo: ["B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "B-"]
  },
  {
    donorType: "B+",
    canDonateTo: ["B+", "AB+"],
    canReceiveFrom: ["O-", "O+", "B-", "B+"]
  },
  {
    donorType: "AB-",
    canDonateTo: ["AB-", "AB+"],
    canReceiveFrom: ["O-", "A-", "B-", "AB-"]
  },
  {
    donorType: "AB+",
    canDonateTo: ["AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
  }
];

export interface BloodBankContextType {
  donors: Donor[];
  recipients: Recipient[];
  inventory: Inventory[];
  transfusions: Transfusion[];
  blockchain: BlockchainRecord[];
  inventoryStats: InventoryStats;
  compatibilityMatrix: BloodTypeCompatibility[];
  isLoading: boolean;
  lastRefresh: number;
  
  addDonor: (donor: Omit<Donor, 'id' | 'createdAt' | 'updatedAt' | 'donationCount'>) => Promise<Donor | null>;
  updateDonor: (id: string, donor: Partial<Donor>) => void;
  getDonorById: (id: string) => Donor | undefined;
  
  addRecipient: (recipient: Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Recipient | null>;
  updateRecipient: (id: string, recipient: Partial<Recipient>) => void;
  getRecipientById: (id: string) => Recipient | undefined;
  findMatchingDonors: (bloodType: BloodType, urgencyLevel: string, latitude?: number, longitude?: number) => Inventory[];
  
  addInventory: (inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'expiryDate'>) => Promise<Inventory | null>;
  updateInventoryStatus: (id: string, status: Inventory['status']) => void;
  getInventoryById: (id: string) => Inventory | undefined;
  
  addTransfusion: (transfusion: Omit<Transfusion, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transfusion | null>;
  updateTransfusionStatus: (id: string, status: Transfusion['status'], notes?: string) => void;
  getTransfusionById: (id: string) => Transfusion | undefined;
  
  verifyBloodUnit: (inventoryId: string) => { isValid: boolean; record: BlockchainRecord };
  getBlockchainForDonor: (donorId: string) => BlockchainRecord[];
  getBlockchainForRecipient: (recipientId: string) => BlockchainRecord[];
  verifyDonorId: (donorId: string) => Promise<{ 
    found: boolean; 
    donation?: { donorName: string; bloodType: string; date: string; status: string; } 
  }>;
  findClosestDonors: (bloodType: BloodType, latitude: number, longitude: number, k?: number) => Promise<Donor[]>;
  refreshData: () => Promise<boolean>;
}

const BloodBankContext = createContext<BloodBankContextType | undefined>(undefined);

export const BloodBankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [donors, setDonors] = useState<Donor[]>(mockDonors);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [transfusions, setTransfusions] = useState<Transfusion[]>([]);
  const [blockchain, setBlockchain] = useState<BlockchainRecord[]>([]);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>(mockInventoryStats);
  const [compatibilityMatrix, setCompatibilityMatrix] = useState<BloodTypeCompatibility[]>(bloodTypeCompatibilityMatrix);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const dbDonors = await supabaseService.fetchDonors();
      const dbInventory = await supabaseService.fetchInventory();
      const dbRecipients = await supabaseService.fetchRecipients();
      
      setDonors(dbDonors.length > 0 ? dbDonors : mockDonors);
      setInventory(dbInventory.length > 0 ? dbInventory : mockInventory);
      setRecipients(dbRecipients.length > 0 ? dbRecipients : mockRecipients);
      
      updateInventoryStats(dbInventory.length > 0 ? dbInventory : mockInventory);
      
      console.log("Data refreshed from Supabase:", { 
        donorsCount: dbDonors.length, 
        inventoryCount: dbInventory.length, 
        recipientsCount: dbRecipients.length,
        timestamp: new Date().toISOString()
      });
      
      addNotification(
        "Data Refreshed", 
        `Successfully synchronized with database. Found ${dbDonors.length} donors, ${dbInventory.length} inventory items, and ${dbRecipients.length} recipients.`,
        "info"
      );
      
      setLastRefresh(Date.now());
      return true;
    } catch (error) {
      console.error("Error refreshing data from Supabase:", error);
      
      toast({
        title: "Error refreshing data",
        description: "Could not refresh data from the database.",
        variant: "destructive"
      });
      
      addNotification(
        "Sync Failed", 
        "Failed to refresh data from the database. Please try again later.",
        "error"
      );
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [toast]);

  const addDonor = async (donorData: Omit<Donor, 'id' | 'createdAt' | 'updatedAt' | 'donationCount'>) => {
    try {
      const newDonor = await supabaseService.createDonor(donorData);
      
      if (newDonor) {
        setDonors(prev => [...prev, newDonor]);
        
        addNotification(
          "Donor Added", 
          `${newDonor.name} has been successfully registered as a donor.`,
          "success",
          "/donors"
        );
        
        return newDonor;
      } else {
        const now = new Date().toISOString();
        const fallbackDonor: Donor = {
          ...donorData,
          id: `d${donors.length + 1}`.padStart(4, '0'),
          donationCount: 0,
          createdAt: now,
          updatedAt: now
        };
        
        setDonors(prev => [...prev, fallbackDonor]);
        return fallbackDonor;
      }
    } catch (error) {
      console.error("Error adding donor:", error);
      
      toast({
        title: "Error adding donor",
        description: "Could not save donor to the database",
        variant: "destructive"
      });
      
      addNotification(
        "Failed to Add Donor", 
        "There was an error while trying to add the new donor to the database.",
        "error"
      );
      
      return null;
    }
  };

  const updateDonor = (id: string, donorData: Partial<Donor>) => {
    setDonors(donors.map(donor => 
      donor.id === id 
        ? { ...donor, ...donorData, updatedAt: new Date().toISOString() } 
        : donor
    ));
  };

  const getDonorById = (id: string) => {
    return donors.find(donor => donor.id === id);
  };

  const addRecipient = async (recipientData: Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRecipient = await supabaseService.createRecipient(recipientData);
      
      if (newRecipient) {
        setRecipients(prev => [...prev, newRecipient]);
        return newRecipient;
      } else {
        const now = new Date().toISOString();
        const fallbackRecipient: Recipient = {
          ...recipientData,
          id: `r${recipients.length + 1}`.padStart(4, '0'),
          createdAt: now,
          updatedAt: now
        };
        
        setRecipients(prev => [...prev, fallbackRecipient]);
        return fallbackRecipient;
      }
    } catch (error) {
      console.error("Error adding recipient:", error);
      toast({
        title: "Error adding recipient",
        description: "Could not save recipient to the database",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateRecipient = (id: string, recipientData: Partial<Recipient>) => {
    setRecipients(recipients.map(recipient => 
      recipient.id === id 
        ? { ...recipient, ...recipientData, updatedAt: new Date().toISOString() } 
        : recipient
    ));
  };

  const getRecipientById = (id: string) => {
    return recipients.find(recipient => recipient.id === id);
  };

  const findMatchingDonors = (bloodType: BloodType, urgencyLevel: string, latitude?: number, longitude?: number) => {
    const compatibilityData = compatibilityMatrix.find(c => c.donorType === bloodType);
    
    if (!compatibilityData) return [];
    
    let compatibleInventory = inventory.filter(item => 
      compatibilityData.canReceiveFrom.includes(item.bloodType as BloodType) && 
      item.status === 'Available'
    );
    
    if (latitude !== undefined && longitude !== undefined) {
      compatibleInventory = compatibleInventory.map(item => {
        const donor = donors.find(d => d.id === item.donorId);
        
        let distance = Infinity;
        if (donor && donor.latitude && donor.longitude) {
          distance = supabaseService.calculateDistance(latitude, longitude, donor.latitude, donor.longitude);
        }
        
        return {
          ...item,
          distance: distance
        };
      });
      
      compatibleInventory.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    if (urgencyLevel === 'Critical' || urgencyLevel === 'High') {
      return compatibleInventory.sort((a, b) => {
        if (a.bloodType === bloodType && b.bloodType !== bloodType) return -1;
        if (a.bloodType !== bloodType && b.bloodType === bloodType) return 1;
        return 0;
      });
    }
    
    return compatibleInventory;
  };

  const addInventory = async (inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'expiryDate'>) => {
    try {
      const newInventory = await supabaseService.createInventory(inventory);
      
      if (newInventory) {
        setInventory(prev => [...prev, newInventory]);
        
        const now = new Date().toISOString();
        const newBlock: BlockchainRecord = {
          blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
          transactionType: 'Donation',
          donorId: inventory.donorId,
          inventoryId: newInventory.id,
          previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
          status: 'Valid',
          data: {
            bloodType: inventory.bloodType,
            quantity: inventory.quantity,
            donationDate: inventory.donationDate
          },
          timestamp: now,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`
        };
        
        setBlockchain((prev: BlockchainRecord[]) => [...prev, newBlock]);
        
        const donor = getDonorById(inventory.donorId);
        if (donor) {
          updateDonor(donor.id, {
            donationCount: donor.donationCount + 1,
            lastDonationDate: inventory.donationDate
          });
        }
        
        updateInventoryStats();
        return newInventory;
      } else {
        // Fallback to mock generation if database fails
        console.warn('Database add failed, creating local fallback inventory entry');
        
        const donationDate = new Date(inventory.donationDate);
        const expiryDate = new Date(donationDate);
        expiryDate.setDate(donationDate.getDate() + 42); // 42 days expiry
        
        const now = new Date().toISOString();
        const fallbackInventory: Inventory = {
          ...inventory,
          id: `i${Math.floor(Math.random() * 1000)}`,
          expiryDate: expiryDate.toISOString().split('T')[0],
          createdAt: now,
          updatedAt: now
        };
        
        setInventory((prev: Inventory[]) => [...prev, fallbackInventory]);
        
        const newBlock: BlockchainRecord = {
          blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
          transactionType: 'Donation',
          donorId: inventory.donorId,
          inventoryId: fallbackInventory.id,
          previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
          status: 'Valid',
          data: {
            bloodType: inventory.bloodType,
            quantity: inventory.quantity,
            donationDate: inventory.donationDate
          },
          timestamp: now,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`
        };
        
        setBlockchain((prev: BlockchainRecord[]) => [...prev, newBlock]);
        
        const donor = getDonorById(inventory.donorId);
        if (donor) {
          updateDonor(donor.id, {
            donationCount: donor.donationCount + 1,
            lastDonationDate: inventory.donationDate
          });
        }
        
        return fallbackInventory;
      }
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error adding inventory",
        description: "Could not save inventory to the database",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateInventoryStatus = (id: string, status: Inventory['status']) => {
    // First update the local state
    const itemToUpdate = inventory.find(item => item.id === id);
    const oldStatus = itemToUpdate?.status;
    
    setInventory(inventory.map(item => 
      item.id === id 
        ? { ...item, status, updatedAt: new Date().toISOString() } 
        : item
    ));
    
    // Then update the database
    supabaseService.updateInventoryStatus(id, status)
      .then(success => {
        if (success) {
          // Add a notification about the status change
          const inventoryItem = inventory.find(item => item.id === id);
          if (inventoryItem) {
            const donor = getDonorById(inventoryItem.donorId);
            const donorName = donor ? donor.name : "Unknown donor";
            
            addNotification(
              "Inventory Status Updated", 
              `Blood unit (${inventoryItem.bloodType}) from ${donorName} has been changed from ${oldStatus} to ${status}.`,
              status === 'Expired' || status === 'Discarded' ? "warning" : "info",
              "/inventory"
            );
          }
        } else {
          console.error(`Failed to update inventory status in database for ID: ${id}`);
          
          toast({
            title: "Database Sync Error",
            description: "Status was updated locally but failed to update in the database.",
            variant: "destructive"
          });
          
          addNotification(
            "Status Update Failed", 
            `Failed to update inventory status in the database for ID: ${id}. The local status was updated but may not persist.`,
            "error",
            "/inventory"
          );
        }
      })
      .catch(error => {
        console.error("Error updating inventory status in database:", error);
        
        addNotification(
          "Status Update Error", 
          `An error occurred while updating inventory status: ${error.message}`,
          "error",
          "/inventory"
        );
      });
    
    updateInventoryStats();
  };

  const getInventoryById = (id: string) => {
    return inventory.find(item => item.id === id);
  };

  const updateInventoryStats = (inventoryData = inventory) => {
    const availableInventory = inventoryData.filter(item => item.status === 'Available');
    
    const byBloodType: Record<BloodType, number> = {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0, 
      "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
    };
    
    availableInventory.forEach(item => {
      byBloodType[item.bloodType as BloodType] = (byBloodType[item.bloodType as BloodType] || 0) + 1;
    });
    
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(now.getDate() + 7);
    
    const expiringWithin7Days = availableInventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= inSevenDays && expiryDate >= now;
    }).length;
    
    const criticalLevels = Object.entries(byBloodType)
      .filter(([_, count]) => count < 2)
      .map(([type]) => type as BloodType);
    
    setInventoryStats({
      total: availableInventory.length,
      byBloodType,
      expiringWithin7Days,
      criticalLevels
    });
  };

  const addTransfusion = async (transfusion: Omit<Transfusion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransfusion = await supabaseService.createTransfusion(transfusion);
      
      if (newTransfusion) {
        setTransfusions(prev => [...prev, newTransfusion]);
        
        updateInventoryStatus(transfusion.inventoryId, 'Reserved');
        
        const recipient = getRecipientById(transfusion.recipientId);
        const recipientName = recipient ? recipient.name : "Unknown";
        
        addNotification(
          "Transfusion Scheduled", 
          `A new transfusion has been scheduled for ${recipientName} with blood type ${transfusion.bloodType}.`,
          "success",
          "/transfusions"
        );
        
        const now = new Date().toISOString();
        const newBlock: BlockchainRecord = {
          blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
          transactionType: 'Transfusion',
          donorId: transfusion.donorId,
          recipientId: transfusion.recipientId,
          inventoryId: transfusion.inventoryId,
          transfusionId: newTransfusion.id,
          previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
          status: 'Pending',
          data: {
            bloodType: transfusion.bloodType,
            quantity: transfusion.quantity,
            transfusionDate: transfusion.date,
            hospital: transfusion.hospitalName,
            latitude: transfusion.latitude,
            longitude: transfusion.longitude
          },
          timestamp: now,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`
        };
        
        setBlockchain(prev => [...prev, newBlock]);
        return newTransfusion;
      } else {
        const now = new Date().toISOString();
        const fallbackTransfusion: Transfusion = {
          ...transfusion,
          id: `t${transfusions.length + 1}`.padStart(4, '0'),
          createdAt: now,
          updatedAt: now
        };
        
        setTransfusions(prev => [...prev, fallbackTransfusion]);
        
        updateInventoryStatus(transfusion.inventoryId, 'Reserved');
        
        const newBlock: BlockchainRecord = {
          blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
          transactionType: 'Transfusion',
          donorId: transfusion.donorId,
          recipientId: transfusion.recipientId,
          inventoryId: transfusion.inventoryId,
          transfusionId: fallbackTransfusion.id,
          previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
          status: 'Pending',
          data: {
            bloodType: transfusion.bloodType,
            quantity: transfusion.quantity,
            transfusionDate: transfusion.date,
            hospital: transfusion.hospitalName,
            latitude: transfusion.latitude,
            longitude: transfusion.longitude
          },
          timestamp: now,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`
        };
        
        setBlockchain((prev: BlockchainRecord[]) => [...prev, newBlock]);
        return fallbackTransfusion;
      }
    } catch (error) {
      console.error("Error adding transfusion:", error);
      
      toast({
        title: "Error adding transfusion",
        description: "Could not save transfusion to the database",
        variant: "destructive"
      });
      
      addNotification(
        "Transfusion Creation Failed", 
        "There was an error while trying to schedule the transfusion.",
        "error",
        "/transfusions"
      );
      
      return null;
    }
  };

  const updateTransfusionStatus = (id: string, status: Transfusion['status'], notes?: string) => {
    let updatedTransfusion: Transfusion | undefined;
    
    setTransfusions(transfusions.map(transfusion => {
      if (transfusion.id === id) {
        updatedTransfusion = {
          ...transfusion,
          status,
          notes: notes ? `${transfusion.notes}\n${notes}` : transfusion.notes,
          updatedAt: new Date().toISOString()
        };
        return updatedTransfusion;
      }
      return transfusion;
    }));
    
    if (updatedTransfusion) {
      // Notify about transfusion status change
      const recipient = getRecipientById(updatedTransfusion.recipientId);
      const recipientName = recipient ? recipient.name : "Unknown";
      
      addNotification(
        "Transfusion Status Updated", 
        `Transfusion for ${recipientName} has been marked as ${status}${notes ? ': ' + notes : ''}.`,
        status === 'Completed' ? "success" : status === 'Failed' ? "error" : "info",
        "/transfusions"
      );
      
      if (status === 'Completed') {
        updateInventoryStatus(updatedTransfusion.inventoryId, 'Used');
        
        addNotification(
          "Blood Unit Used", 
          `A blood unit has been successfully used in transfusion ${id}.`,
          "info",
          "/inventory"
        );
      } else if (status === 'Failed') {
        const inventoryItem = getInventoryById(updatedTransfusion.inventoryId);
        if (inventoryItem) {
          const expiryDate = new Date(inventoryItem.expiryDate);
          if (expiryDate > new Date()) {
            updateInventoryStatus(updatedTransfusion.inventoryId, 'Available');
          } else {
            updateInventoryStatus(updatedTransfusion.inventoryId, 'Expired');
          }
        }
      }
      
      const transfusionBlock = blockchain.find(
        block => block.transfusionId === id && block.transactionType === 'Transfusion'
      );
      
      if (transfusionBlock) {
        const now = new Date().toISOString();
        const blockchainStatus = status === 'Completed' ? 'Valid' : 'Invalid';
        
        const newBlock: BlockchainRecord = {
          blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
          transactionType: 'Transfusion',
          donorId: updatedTransfusion.donorId,
          recipientId: updatedTransfusion.recipientId,
          inventoryId: updatedTransfusion.inventoryId,
          transfusionId: updatedTransfusion.id,
          previousBlockId: transfusionBlock.blockId,
          status: blockchainStatus,
          data: {
            ...transfusionBlock.data,
            status,
            completedDate: now,
            notes
          },
          timestamp: now,
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`
        };
        
        setBlockchain(prev => [...prev, newBlock]);
      }
    }
  };

  const getTransfusionById = (id: string) => {
    return transfusions.find(transfusion => transfusion.id === id);
  };

  const verifyBloodUnit = (inventoryId: string) => {
    const records = blockchain.filter(record => record.inventoryId === inventoryId);
    
    if (records.length === 0) {
      const invalidRecord: BlockchainRecord = {
        blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
        transactionType: 'Verification',
        inventoryId,
        previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
        status: 'Invalid',
        data: {
          message: "No blockchain records found for this inventory item",
          verificationDate: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`
      };
      
      setBlockchain(prev => [...prev, invalidRecord]);
      return { isValid: false, record: invalidRecord };
    }
    
    const donationRecord = records.find(
      record => record.transactionType === 'Donation' && record.status === 'Valid'
    );
    
    if (!donationRecord) {
      const invalidRecord: BlockchainRecord = {
        blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
        transactionType: 'Verification',
        inventoryId,
        previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
        status: 'Invalid',
        data: {
          message: "No valid donation record found",
          verificationDate: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`
      };
      
      setBlockchain(prev => [...prev, invalidRecord]);
      return { isValid: false, record: invalidRecord };
    }
    
    const inventoryItem = getInventoryById(inventoryId);
    if (!inventoryItem) {
      const invalidRecord: BlockchainRecord = {
        blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
        transactionType: 'Verification',
        inventoryId,
        previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
        status: 'Invalid',
        data: {
          message: "Inventory item not found",
          verificationDate: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`
      };
      
      setBlockchain(prev => [...prev, invalidRecord]);
      return { isValid: false, record: invalidRecord };
    }
    
    const transfusionRecord = records.find(
      record => record.transactionType === 'Transfusion' && record.status === 'Valid'
    );
    
    if (transfusionRecord && inventoryItem.status !== 'Used') {
      const invalidRecord: BlockchainRecord = {
        blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
        transactionType: 'Verification',
        inventoryId,
        donorId: donationRecord.donorId,
        recipientId: transfusionRecord?.recipientId,
        previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
        status: 'Invalid',
        data: {
          message: "Transfusion record exists but inventory status doesn't match",
          verificationDate: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`
      };
      
      setBlockchain(prev => [...prev, invalidRecord]);
      return { isValid: false, record: invalidRecord };
    }
    
    const validRecord: BlockchainRecord = {
      blockId: `b${blockchain.length + 1}`.padStart(4, '0'),
      transactionType: 'Verification',
      inventoryId,
      donorId: donationRecord.donorId,
      recipientId: transfusionRecord?.recipientId,
      previousBlockId: blockchain.length > 0 ? blockchain[blockchain.length - 1].blockId : undefined,
      status: 'Valid',
      data: {
        message: "Blood unit verified successfully",
        verificationDate: new Date().toISOString(),
        inventoryStatus: inventoryItem.status
      },
      timestamp: new Date().toISOString(),
      hash: `0x${Math.random().toString(16).substring(2, 10)}...`
    };
    
    setBlockchain(prev => [...prev, validRecord]);
    return { isValid: true, record: validRecord };
  };

  const getBlockchainForDonor = (donorId: string) => {
    return blockchain.filter(record => record.donorId === donorId);
  };

  const getBlockchainForRecipient = (recipientId: string) => {
    return blockchain.filter(record => record.recipientId === recipientId);
  };

  const verifyDonorId = async (donorId: string) => {
    try {
      return await supabaseService.verifyDonorId(donorId);
    } catch (error) {
      console.error("Error verifying donor ID:", error);
      
      const donor = donors.find(d => d.id === donorId);
      if (!donor) {
        return { found: false };
      }
      
      const donorInventory = inventory.find(item => item.donorId === donorId);
      if (!donorInventory) {
        return { 
          found: true, 
          donation: {
            donorName: donor.name,
            bloodType: donor.bloodType,
            date: "No donations recorded",
            status: "N/A"
          } 
        };
      }
      
      const donorTransfusion = transfusions.find(t => t.donorId === donorId);
      
      return {
        found: true,
        donation: {
          donorName: donor.name,
          bloodType: donor.bloodType,
          date: donorInventory.donationDate,
          status: donorTransfusion ? "Used in transfusion" : donorInventory.status
        }
      };
    }
  };

  const findClosestDonors = async (bloodType: BloodType, latitude: number, longitude: number, k = 5) => {
    try {
      // Import required services dynamically to avoid circular dependencies
      const { trainKNNWithDatabaseDonors, findNearestDonors } = await import('@/services/knnService');
      
      // Train KNN model with database donors first
      await trainKNNWithDatabaseDonors();
      
      // Use the trained model to find closest donors
      return findNearestDonors(bloodType, latitude, longitude, k);
    } catch (error) {
      console.error('Error using KNN to find closest donors:', error);
      // Fallback to the original implementation
      return await supabaseService.findClosestDonors(bloodType, latitude, longitude, k);
    }
  };

  const value = {
    donors,
    recipients,
    inventory,
    transfusions,
    blockchain,
    inventoryStats,
    compatibilityMatrix,
    isLoading,
    lastRefresh,
    
    addDonor,
    updateDonor,
    getDonorById,
    
    addRecipient,
    updateRecipient,
    getRecipientById,
    findMatchingDonors,
    
    addInventory,
    updateInventoryStatus,
    getInventoryById,
    
    addTransfusion,
    updateTransfusionStatus,
    getTransfusionById,
    
    verifyBloodUnit,
    getBlockchainForDonor,
    getBlockchainForRecipient,
    verifyDonorId,
    findClosestDonors,
    refreshData
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <BloodBankContext.Provider value={value}>
      {children}
    </BloodBankContext.Provider>
  );
};

export const useBloodBank = () => {
  const context = useContext(BloodBankContext);
  if (context === undefined) {
    throw new Error('useBloodBank must be used within a BloodBankProvider');
  }
  return context;
};
