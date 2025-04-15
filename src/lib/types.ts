export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RhFactor = 'Positive' | 'Negative';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type InventoryStatus = 'Available' | 'Reserved' | 'Used' | 'Expired' | 'Discarded';

export type TransfusionStatus = 'Pending' | 'Completed' | 'Failed' | 'RequestingAdditional';

export type BlockchainTransactionType = 'Donation' | 'Transfusion' | 'Verification' | 'Expiry';

export type BlockchainStatus = 'Valid' | 'Invalid' | 'Pending';

export interface Donor {
  id: string;
  name: string;
  bloodType: BloodType;
  rhFactor: RhFactor;
  contactNumber: string;
  email: string;
  dateOfBirth: string;
  address: string;
  latitude?: number;
  longitude?: number;
  hasMedicalConditions: boolean;
  isSmoker: boolean;
  consumesAlcohol: boolean;
  lastDonationDate: string | null;
  donationCount: number;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Distance in km (used by KNN algorithm)
}

export interface Recipient {
  id: string;
  name: string;
  bloodType: BloodType;
  rhFactor: RhFactor;
  contactNumber: string;
  email: string;
  dateOfBirth: string;
  address: string;
  latitude?: number;
  longitude?: number;
  urgencyLevel: UrgencyLevel;
  medicalCondition: string;
  hospitalName: string;
  doctorName: string;
  doctorContact: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  donorId: string;
  bloodType: BloodType;
  rhFactor: RhFactor;
  donationDate: string;
  expiryDate: string;
  quantity: number; // in ml
  status: InventoryStatus;
  location: string;
  distance?: number; // For KNN algorithm
  createdAt: string;
  updatedAt: string;
}

export interface Transfusion {
  id: string;
  recipientId: string;
  inventoryId: string;
  donorId: string;
  bloodType: BloodType;
  rhFactor: RhFactor;
  date: string;
  quantity: number; // in ml
  status: TransfusionStatus;
  notes: string;
  hospitalName: string;
  doctorName: string;
  latitude?: number; // Optional location for geocoding
  longitude?: number; // Optional location for geocoding
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainRecord {
  blockId: string;
  transactionType: BlockchainTransactionType;
  donorId?: string;
  recipientId?: string;
  inventoryId?: string;
  transfusionId?: string;
  previousBlockId?: string;
  status: BlockchainStatus;
  data: Record<string, any>;
  timestamp: string;
  hash: string;
}

export interface InventoryStats {
  total: number;
  byBloodType: Record<BloodType, number>;
  expiringWithin7Days: number;
  criticalLevels: BloodType[];
}

export interface BloodTypeCompatibility {
  donorType: BloodType;
  canDonateTo: BloodType[];
  canReceiveFrom: BloodType[];
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  link?: string;
}
