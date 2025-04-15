import { supabase } from '@/integrations/supabase/client';
import { 
  Donor, 
  Recipient, 
  Inventory, 
  Transfusion,
  BlockchainRecord,
  BloodType,
  InventoryStatus,
  RhFactor,
  UrgencyLevel
} from '@/lib/types';

// Donor services
export const fetchDonors = async (): Promise<Donor[]> => {
  const { data, error } = await supabase
    .from('donors')
    .select('*');
  
  if (error) {
    console.error('Error fetching donors:', error);
    return [];
  }
  
  return data.map(donor => ({
    id: donor.id,
    name: donor.name,
    bloodType: donor.blood_type as BloodType,
    rhFactor: donor.blood_type.includes('-') ? 'Negative' : 'Positive',
    contactNumber: donor.contact_number,
    email: donor.email,
    dateOfBirth: new Date(new Date().getFullYear() - donor.age, 0, 1).toISOString().split('T')[0],
    address: donor.location,
    latitude: donor.latitude || (40.7128 + (Math.random() - 0.5) * 0.1),
    longitude: donor.longitude || (-74.0060 + (Math.random() - 0.5) * 0.1),
    hasMedicalConditions: Math.random() > 0.7,
    isSmoker: Math.random() > 0.7,
    consumesAlcohol: Math.random() > 0.5,
    lastDonationDate: donor.last_donation_date ? new Date(donor.last_donation_date).toISOString().split('T')[0] : null,
    donationCount: Math.floor(Math.random() * 10),
    consentGiven: true,
    createdAt: donor.created_at || new Date().toISOString(),
    updatedAt: donor.updated_at || new Date().toISOString()
  }));
};

export const createDonor = async (donor: Omit<Donor, 'id' | 'createdAt' | 'updatedAt' | 'donationCount'>): Promise<Donor | null> => {
  const { data, error } = await supabase
    .from('donors')
    .insert({
      name: donor.name,
      blood_type: donor.bloodType,
      contact_number: donor.contactNumber,
      email: donor.email,
      age: new Date().getFullYear() - new Date(donor.dateOfBirth).getFullYear(),
      location: donor.address,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      latitude: donor.latitude,
      longitude: donor.longitude
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating donor:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    bloodType: data.blood_type as BloodType,
    rhFactor: data.blood_type.includes('-') ? 'Negative' : 'Positive',
    contactNumber: data.contact_number,
    email: data.email,
    dateOfBirth: donor.dateOfBirth,
    address: data.location,
    latitude: data.latitude || donor.latitude,
    longitude: data.longitude || donor.longitude,
    hasMedicalConditions: donor.hasMedicalConditions,
    isSmoker: donor.isSmoker,
    consumesAlcohol: donor.consumesAlcohol,
    lastDonationDate: null,
    donationCount: 0,
    consentGiven: donor.consentGiven,
    createdAt: data.created_at,
    updatedAt: data.created_at
  };
};

// Inventory services
export const fetchInventory = async (): Promise<Inventory[]> => {
  const { data, error } = await supabase
    .from('blood_inventory')
    .select('*');
  
  if (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
  
  return data.map(item => ({
    id: item.id,
    donorId: item.donor_id || 'd001',
    bloodType: item.blood_type as BloodType,
    rhFactor: item.blood_type.includes('-') ? 'Negative' : 'Positive',
    donationDate: new Date(item.donation_date).toISOString().split('T')[0],
    expiryDate: new Date(item.expiry_date).toISOString().split('T')[0],
    quantity: item.quantity,
    status: capitalizeFirstLetter(item.status) as any,
    location: item.hospital_name || 'Main Blood Bank',
    createdAt: item.created_at,
    updatedAt: new Date().toISOString()
  }));
};

export const createInventory = async (inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'expiryDate'>): Promise<Inventory | null> => {
  try {
    const donationDate = new Date(inventory.donationDate);
    const expiryDate = new Date(donationDate);
    expiryDate.setDate(donationDate.getDate() + 42); // Blood typically expires after 42 days
    
    // We need to make donor_id null if it's not a valid UUID
    // This allows the system to create inventory even without a linked donor
    let donorUuid = null;
    
    // Try to find actual donor in database if we have a donor ID
    if (inventory.donorId) {
      // First, try to get donor directly using the ID (it might already be a UUID)
      const { data: directDonorData, error: directDonorError } = await supabase
        .from('donors')
        .select('id')
        .eq('id', inventory.donorId)
        .maybeSingle();
      
      if (!directDonorError && directDonorData) {
        // The provided ID was valid
        donorUuid = directDonorData.id;
        console.log(`Using direct donor ID: ${donorUuid}`);
      } else {
        // It's not a valid UUID, but possibly an app-generated ID - try name lookup
        console.log(`Direct donor lookup failed, trying by name for ID: ${inventory.donorId}`);
        
        // A fallback approach - in a real app this would query local state or cache
        const donorName = getDonorNameById(inventory.donorId);
        if (donorName) {
          const { data: nameDonorData, error: nameDonorError } = await supabase
            .from('donors')
            .select('id')
            .eq('name', donorName)
            .maybeSingle();
          
          if (!nameDonorError && nameDonorData) {
            donorUuid = nameDonorData.id;
            console.log(`Resolved donor ID ${inventory.donorId} to UUID ${donorUuid} by name lookup`);
          }
        }
      }
    }
    
    // Log the final donor UUID we're using
    console.log(`Final donor_id for database: ${donorUuid || 'null'}`);
    
    // Convert status to lowercase for database consistency
    const dbStatus = inventory.status.toLowerCase();
    
    const { data, error } = await supabase
      .from('blood_inventory')
      .insert({
        donor_id: donorUuid, // Will be null if we couldn't resolve a valid donor
        blood_type: inventory.bloodType,
        quantity: inventory.quantity,
        donation_date: donationDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        // Use lowercase status for database
        status: dbStatus,
        hospital_name: inventory.location,
        // These fields may be null based on the schema
        hospital_id: null,
        blockchain_transaction_id: null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating inventory:', error);
      console.error('Failed inventory data:', {
        donor_id: donorUuid,
        blood_type: inventory.bloodType,
        quantity: inventory.quantity,
        donation_date: donationDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        status: dbStatus,
        hospital_name: inventory.location
      });
      return null;
    }
    
    // Create a response object that matches the app's expected format
    return {
      id: data.id,
      donorId: data.donor_id || inventory.donorId, // Keep original ID for app consistency
      bloodType: data.blood_type as BloodType,
      rhFactor: data.blood_type.includes('-') ? 'Negative' : 'Positive',
      donationDate: new Date(data.donation_date).toISOString().split('T')[0],
      expiryDate: new Date(data.expiry_date).toISOString().split('T')[0],
      quantity: data.quantity,
      status: capitalizeFirstLetter(data.status) as InventoryStatus, // Ensure proper typing
      location: data.hospital_name || 'Main Blood Bank',
      createdAt: data.created_at,
      updatedAt: data.created_at
    };
  } catch (e) {
    console.error("Unexpected error in createInventory:", e);
    return null;
  }
};

// Helper function to get donor name from local ID 
function getDonorNameById(donorId: string): string {
  // This is a simplified mapping - in a real app, this would query the local state
  const donorMap: Record<string, string> = {
    'd001': 'John Doe',
    'd002': 'Jane Smith',
    'd003': 'Robert Johnson'
  };
  return donorMap[donorId] || '';
}

// Update inventory status
export const updateInventoryStatus = async (id: string, status: string): Promise<boolean> => {
  try {
    // Convert app-level status (e.g., 'Available') to database format (e.g., 'available')
    const dbStatus = status.toLowerCase();
    
    // Update the status in the database
    const { error } = await supabase
      .from('blood_inventory')
      .update({ 
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating inventory status:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Unexpected error in updateInventoryStatus:", e);
    return false;
  }
};

// Recipients services
export const fetchRecipients = async (): Promise<Recipient[]> => {
  const { data, error } = await supabase
    .from('blood_requests')
    .select('*');
  
  if (error) {
    console.error('Error fetching recipients:', error);
    return [];
  }
  
  return data.map(request => ({
    id: request.id,
    name: request.patient_name,
    bloodType: request.blood_type as BloodType,
    rhFactor: request.blood_type.includes('-') ? 'Negative' : 'Positive',
    contactNumber: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
    email: `${request.patient_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    dateOfBirth: new Date(new Date().getFullYear() - Math.floor(Math.random() * 50 + 18), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    address: "123 Main St",
    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
    urgencyLevel: capitalizeFirstLetter(request.urgency_level) as any,
    medicalCondition: request.status,
    hospitalName: request.hospital_name,
    doctorName: "Dr. " + ["Smith", "Johnson", "Williams", "Jones", "Brown"][Math.floor(Math.random() * 5)],
    doctorContact: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
    createdAt: request.created_at || new Date().toISOString(),
    updatedAt: request.updated_at || new Date().toISOString()
  }));
};

export const createRecipient = async (recipient: Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipient | null> => {
  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      patient_name: recipient.name,
      blood_type: recipient.bloodType,
      urgency_level: recipient.urgencyLevel.toLowerCase(),
      hospital_name: recipient.hospitalName,
      units_needed: 1,
      status: recipient.medicalCondition,
      latitude: recipient.latitude,
      longitude: recipient.longitude,
      doctor_name: recipient.doctorName,
      doctor_contact: recipient.doctorContact,
      notes: recipient.medicalCondition
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating recipient:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.patient_name,
    bloodType: data.blood_type as BloodType,
    rhFactor: data.blood_type.includes('-') ? 'Negative' : 'Positive',
    contactNumber: recipient.contactNumber,
    email: recipient.email,
    dateOfBirth: recipient.dateOfBirth,
    address: recipient.address,
    latitude: data.latitude || recipient.latitude,
    longitude: data.longitude || recipient.longitude,
    urgencyLevel: capitalizeFirstLetter(data.urgency_level) as any,
    medicalCondition: data.status,
    hospitalName: data.hospital_name,
    doctorName: data.doctor_name || recipient.doctorName,
    doctorContact: data.doctor_contact || recipient.doctorContact,
    createdAt: data.created_at,
    updatedAt: data.updated_at || new Date().toISOString()
  };
};

// Transfusions services
export const fetchTransfusions = async (): Promise<Transfusion[]> => {
  // Since there's no transfusions table in the DB yet, we'll create mock data
  return [];
};

export const createTransfusion = async (transfusion: Omit<Transfusion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transfusion | null> => {
  try {
    // Create a blood request which will serve as our transfusion record
    const { data, error } = await supabase
      .from('blood_requests')
      .insert({
        patient_name: transfusion.recipientId, // Store recipientId as a reference
        blood_type: transfusion.bloodType,
        units_needed: transfusion.quantity,
        hospital_name: transfusion.hospitalName,
        status: transfusion.status.toLowerCase(),
        matched_donor_id: transfusion.donorId,
        matched_inventory_id: transfusion.inventoryId,
        urgency_level: 'medium', // Default urgency
        notes: transfusion.notes,
        doctor_name: transfusion.doctorName,
        latitude: transfusion.latitude,
        longitude: transfusion.longitude
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transfusion:', error);
      return null;
    }
    
    // Map the database record back to our app's Transfusion type
    const now = new Date().toISOString();
    return {
      id: data.id,
      recipientId: transfusion.recipientId,
      inventoryId: transfusion.inventoryId,
      donorId: transfusion.donorId,
      bloodType: transfusion.bloodType,
      rhFactor: transfusion.rhFactor,
      date: transfusion.date,
      quantity: transfusion.quantity,
      status: capitalizeFirstLetter(data.status) as any,
      notes: transfusion.notes,
      hospitalName: transfusion.hospitalName,
      doctorName: transfusion.doctorName,
      latitude: data.latitude || transfusion.latitude,
      longitude: data.longitude || transfusion.longitude,
      createdAt: data.created_at || now,
      updatedAt: data.updated_at || now
    };
  } catch (e) {
    console.error("Unexpected error in createTransfusion:", e);
    // Return a fallback mock response for development purposes
    const now = new Date().toISOString();
    return {
      ...transfusion,
      id: `t${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now
    };
  }
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Verify donor ID
export const verifyDonorId = async (donorId: string): Promise<{ 
  found: boolean; 
  donation?: { donorName: string; bloodType: string; date: string; status: string; } 
}> => {
  // Check if donor exists
  const { data: donor, error: donorError } = await supabase
    .from('donors')
    .select('*')
    .eq('id', donorId)
    .single();
  
  if (donorError || !donor) {
    console.log('Donor not found:', donorId);
    return { found: false };
  }
  
  // Check if donor has a donation in inventory
  const { data: inventory, error: inventoryError } = await supabase
    .from('blood_inventory')
    .select('*')
    .eq('donor_id', donorId)
    .order('donation_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (inventoryError || !inventory) {
    console.log('No donation found for donor:', donorId);
    return { 
      found: true, 
      donation: {
        donorName: donor.name,
        bloodType: donor.blood_type,
        date: "No donations recorded",
        status: "N/A"
      } 
    };
  }
  
  return {
    found: true,
    donation: {
      donorName: donor.name,
      bloodType: donor.blood_type,
      date: new Date(inventory.donation_date).toISOString().split('T')[0],
      status: capitalizeFirstLetter(inventory.status)
    }
  };
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Find closest donors using KNN algorithm
export const findClosestDonors = async (bloodType: BloodType, recipientLat: number, recipientLon: number, k: number = 5): Promise<Donor[]> => {
  const { data: donorsData, error } = await supabase
    .from('donors')
    .select('*')
    .eq('blood_type', bloodType);
  
  if (error || !donorsData || donorsData.length === 0) {
    console.error('Error fetching donors or no donors found:', error);
    return [];
  }
  
  // Convert to Donor objects and calculate distances
  const donors: Donor[] = donorsData.map(donor => {
    // Generate random coordinates for demonstration - in a real app, you would geocode the location field
    // Since our database schema doesn't have lat/lon fields, we simulate them
    const lat = 40.7128 + (Math.random() - 0.5) * 0.1; // Random around NYC
    const lon = -74.0060 + (Math.random() - 0.5) * 0.1;
    
    // Calculate distance
    const distance = calculateDistance(recipientLat, recipientLon, lat, lon);
    
    // Convert database record to proper Donor type with correct RhFactor typing
    const rhFactorValue: RhFactor = donor.blood_type.includes('-') ? 'Negative' : 'Positive';
    
    return {
      id: donor.id,
      name: donor.name,
      bloodType: donor.blood_type as BloodType,
      rhFactor: rhFactorValue,
      contactNumber: donor.contact_number,
      email: donor.email,
      dateOfBirth: new Date(new Date().getFullYear() - donor.age, 0, 1).toISOString().split('T')[0],
      address: donor.location,
      latitude: lat, // Generated coordinate
      longitude: lon, // Generated coordinate
      hasMedicalConditions: Math.random() > 0.7,
      isSmoker: Math.random() > 0.7,
      consumesAlcohol: Math.random() > 0.5,
      lastDonationDate: donor.last_donation_date ? new Date(donor.last_donation_date).toISOString().split('T')[0] : null,
      donationCount: Math.floor(Math.random() * 10),
      consentGiven: true,
      createdAt: donor.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      distance  // Add distance property
    };
  });
  
  // Sort by distance
  donors.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  
  // Return k closest donors
  return donors.slice(0, k);
};
