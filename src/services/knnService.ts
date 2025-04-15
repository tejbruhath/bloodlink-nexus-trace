import { knnModel } from '@/lib/knn';
import { fetchDonors } from './supabaseService';
import { Donor, BloodType } from '@/lib/types';

/**
 * Train KNN model with donor data from the database
 * @returns Promise that resolves with the number of donors in the trained model
 */
export const trainKNNWithDatabaseDonors = async (): Promise<number> => {
  try {
    // Fetch donors from Supabase
    const donors = await fetchDonors();
    
    // Train the KNN model with the fetched data
    knnModel.train(donors);
    
    console.log(`KNN model trained with ${donors.length} donors from database`);
    return donors.length;
  } catch (error) {
    console.error('Error training KNN model with database donors:', error);
    return 0;
  }
};

/**
 * Train KNN model with a custom dataset
 * @param donorDataset Array of donor data
 * @returns Number of donors in the trained model
 */
export const trainKNNWithCustomDataset = (donorDataset: Donor[]): number => {
  try {
    // Train the KNN model with the provided dataset
    knnModel.train(donorDataset);
    
    console.log(`KNN model trained with ${donorDataset.length} donors from custom dataset`);
    return donorDataset.length;
  } catch (error) {
    console.error('Error training KNN model with custom dataset:', error);
    return 0;
  }
};

/**
 * Find closest donors using the trained KNN model
 * @param recipientBloodType Blood type of the recipient
 * @param recipientLat Recipient's latitude
 * @param recipientLon Recipient's longitude
 * @param k Number of donors to return (default: 5)
 * @returns Promise that resolves with an array of k closest matching donors
 */
export const findNearestDonors = (
  recipientBloodType: BloodType,
  recipientLat: number,
  recipientLon: number,
  k: number = 5
): Donor[] => {
  // Check if model has data
  if (knnModel.getDatasetSize() === 0) {
    console.warn('KNN model has not been trained yet');
    return [];
  }
  
  // Use the trained model to find closest donors
  return knnModel.findClosestDonors(
    recipientBloodType,
    recipientLat,
    recipientLon,
    k,
    true // Consider blood type compatibility
  );
};

/**
 * Generate a sample dataset for testing the KNN model
 * @param size Number of donors to generate
 * @returns Array of generated donor data
 */
export const generateSampleDataset = (size: number = 100): Donor[] => {
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const names = [
    'John Smith', 'Mary Johnson', 'James Brown', 'Patricia Williams', 'Robert Jones',
    'Linda Davis', 'Michael Miller', 'Elizabeth Wilson', 'William Moore', 'Barbara Taylor',
    'David Anderson', 'Jennifer Thomas', 'Richard Jackson', 'Margaret White', 'Charles Harris'
  ];
  
  // Base coordinates (New York City)
  const baseLat = 40.7128;
  const baseLon = -74.0060;
  
  const donors: Donor[] = [];
  
  for (let i = 0; i < size; i++) {
    // Generate random values
    const randomBloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    // Random location within ~10km of base coordinates
    const latVariation = (Math.random() - 0.5) * 0.1; // ~5.5km in latitude
    const lonVariation = (Math.random() - 0.5) * 0.1; // ~5.5km in longitude
    
    const donor: Donor = {
      id: `d${i.toString().padStart(3, '0')}`,
      name: randomName,
      bloodType: randomBloodType,
      rhFactor: randomBloodType.includes('-') ? 'Negative' : 'Positive',
      contactNumber: `555-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
      dateOfBirth: new Date(
        1960 + Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString().split('T')[0],
      address: `${Math.floor(100 + Math.random() * 900)} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} St`,
      latitude: baseLat + latVariation,
      longitude: baseLon + lonVariation,
      hasMedicalConditions: Math.random() > 0.8,
      isSmoker: Math.random() > 0.7,
      consumesAlcohol: Math.random() > 0.5,
      lastDonationDate: new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString().split('T')[0],
      donationCount: Math.floor(Math.random() * 10),
      consentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    donors.push(donor);
  }
  
  return donors;
};

// Example of how to use the KNN model with a custom dataset
export const initializeKNNWithSampleData = (): Donor[] => {
  // Generate a sample dataset
  const sampleData = generateSampleDataset(100);
  
  // Train the model with the sample data
  trainKNNWithCustomDataset(sampleData);
  
  return sampleData;
}; 