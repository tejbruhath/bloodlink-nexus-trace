import { BloodType, Donor } from '@/lib/types';
import { knnModel } from '@/lib/knn';
import { 
  indianCities, 
  indianFirstNames, 
  indianLastNames, 
  generateIndianPhoneNumber, 
  generateIndianAddress,
  IndianCity
} from '@/lib/indianCities';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Generate a dataset of Indian donors based on city locations
 * @param size Number of donors to generate
 * @returns Array of generated Indian donor data
 */
export const generateIndianDonorDataset = (size: number = 300): Donor[] => {
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  // Blood type distribution in India (approximate)
  const bloodTypeDistribution = {
    'A+': 0.20, 'A-': 0.04,
    'B+': 0.35, 'B-': 0.05,
    'O+': 0.30, 'O-': 0.03,
    'AB+': 0.02, 'AB-': 0.01
  };
  const donors: Donor[] = [];
  
  for (let i = 0; i < size; i++) {
    // Select random city - weight by population
    const totalPopulation = indianCities.reduce((sum, city) => sum + city.population, 0);
    let randomPop = Math.random() * totalPopulation;
    let selectedCity: IndianCity = indianCities[0];
    
    for (const city of indianCities) {
      randomPop -= city.population;
      if (randomPop <= 0) {
        selectedCity = city;
        break;
      }
    }
    
    // Add small random offset to coordinates to distribute donors around the city
    const latOffset = (Math.random() - 0.5) * 0.1;  // ~5km radius
    const lonOffset = (Math.random() - 0.5) * 0.1;
    
    // Generate random blood type based on Indian distribution
    let randomBloodType = bloodTypes[0];
    const randValue = Math.random();
    let cumulativeProbability = 0;
    
    for (const [bloodType, probability] of Object.entries(bloodTypeDistribution)) {
      cumulativeProbability += probability;
      if (randValue <= cumulativeProbability) {
        randomBloodType = bloodType as BloodType;
        break;
      }
    }
    
    // Generate random name
    const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Generate random donor details
    const donor: Donor = {
      id: `ind${i.toString().padStart(3, '0')}`,
      name: fullName,
      bloodType: randomBloodType,
      rhFactor: randomBloodType.includes('-') ? 'Negative' : 'Positive',
      contactNumber: generateIndianPhoneNumber(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${['gmail.com', 'yahoo.in', 'hotmail.com', 'outlook.com'][Math.floor(Math.random() * 4)]}`,
      dateOfBirth: new Date(
        1960 + Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString().split('T')[0],
      address: generateIndianAddress(selectedCity.name, selectedCity.state),
      latitude: selectedCity.latitude + latOffset,
      longitude: selectedCity.longitude + lonOffset,
      hasMedicalConditions: Math.random() > 0.85,
      isSmoker: Math.random() > 0.75,
      consumesAlcohol: Math.random() > 0.65,
      lastDonationDate: Math.random() > 0.3 ? new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString().split('T')[0] : null,
      donationCount: Math.floor(Math.random() * 8),
      consentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    donors.push(donor);
  }
  
  return donors;
};

/**
 * City class with KNN implementation for finding closest cities
 */
export class CityFinder {
  private cities: IndianCity[] = [];

  /**
   * Initialize with Indian cities dataset
   */
  constructor() {
    this.cities = [...indianCities];
  }

  /**
   * Find k closest cities to the given coordinates
   * @param latitude Target latitude
   * @param longitude Target longitude
   * @param k Number of cities to return
   * @returns Array of k closest cities
   */
  findClosestCities(latitude: number, longitude: number, k: number = 5): IndianCity[] {
    // Calculate distances
    const citiesWithDistance = this.cities.map(city => ({
      ...city,
      distance: this.calculateDistance(
        latitude, longitude,
        city.latitude, city.longitude
      )
    }));

    // Sort by distance and return k nearest
    citiesWithDistance.sort((a, b) => a.distance - b.distance);
    return citiesWithDistance.slice(0, k);
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

/**
 * Train KNN model with Indian donors dataset
 * @returns Promise that resolves with the number of donors in the trained model
 */
export const trainKNNWithIndianDonors = async (): Promise<number> => {
  try {
    // Generate Indian donor dataset
    const indianDonors = generateIndianDonorDataset(300);
    
    // Train the KNN model with the generated data
    knnModel.train(indianDonors);
    
    console.log(`KNN model trained with ${indianDonors.length} Indian donors`);
    return indianDonors.length;
  } catch (error) {
    console.error('Error training KNN model with Indian donors:', error);
    return 0;
  }
};

/**
 * Find the closest city to given coordinates
 * @param latitude Target latitude
 * @param longitude Target longitude
 * @returns The closest city name
 */
export const findClosestCity = (latitude: number, longitude: number): string => {
  const cityFinder = new CityFinder();
  const closestCities = cityFinder.findClosestCities(latitude, longitude, 1);
  return closestCities.length > 0 ? closestCities[0].name : "Unknown";
};

/**
 * Find nearest donors in an Indian context
 * @param recipientBloodType Recipient's blood type
 * @param latitude Recipient's latitude
 * @param longitude Recipient's longitude
 * @param k Number of donors to return
 * @returns Array of k nearest compatible donors
 */
export const findNearestIndianDonors = (
  recipientBloodType: BloodType,
  latitude: number,
  longitude: number,
  k: number = 5
): Donor[] => {
  // If model isn't trained yet, train it with Indian data
  if (knnModel.getDatasetSize() === 0) {
    // Generate and train with Indian data
    const indianDonors = generateIndianDonorDataset(300);
    knnModel.train(indianDonors);
  }
  
  // Find matching donors using the trained KNN model
  return knnModel.findClosestDonors(
    recipientBloodType,
    latitude,
    longitude,
    k,
    true // Consider blood type compatibility
  );
};

/**
 * Push generated Indian donor data to Supabase
 * @param count Number of donors to generate and upload
 * @returns Promise that resolves with the number of donors successfully uploaded
 */
export const pushIndianDonorsToSupabase = async (count: number = 50): Promise<number> => {
  try {
    // Generate Indian donor dataset
    const indianDonors = generateIndianDonorDataset(count);
    
    // Log what we're about to attempt
    console.log(`Preparing to upload ${indianDonors.length} donors to Supabase`);
    
    // Convert to Supabase format - ensure ALL required fields are included
    const supabaseDonors = indianDonors.map(donor => {
      // Calculate age safely
      const birthDate = new Date(donor.dateOfBirth);
      const age = isNaN(birthDate.getTime()) 
        ? 30 // Default age if date is invalid
        : new Date().getFullYear() - birthDate.getFullYear();
      
      // Ensure all required fields are present and formatted properly
      return {
        name: donor.name,
        blood_type: donor.bloodType,
        contact_number: donor.contactNumber || "+91" + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        email: donor.email,
        age: age,
        location: donor.address || "Unknown location, India",
        gender: Math.random() > 0.5 ? 'Male' : 'Female'
      };
    });
    
    // Debug - log first donor to see the structure
    console.log('First donor to upload:', supabaseDonors[0]);
    
    // Upload to Supabase in batches to avoid timeouts
    const batchSize = 1; // Start with 1 to test, then increase if successful
    let successCount = 0;
    
    for (let i = 0; i < supabaseDonors.length; i += batchSize) {
      const batch = supabaseDonors.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('donors')
          .insert(batch)
          .select();
        
        if (error) {
          console.error('Error uploading batch to Supabase:', error);
          console.error('Error code:', error.code);
          console.error('Error details:', error.details);
          console.error('Error hint:', error.hint);
          console.error('Failed data:', JSON.stringify(batch, null, 2));
          
          // Try to get more info about constraints
          if (error.code === '23505') {
            console.log('Possible duplicate key violation - continuing with next batch');
          } else if (error.code === '23502') {
            console.log('NOT NULL constraint violation - a required field is missing');
          }
        } else {
          successCount += data?.length || 0;
          console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1}, success: ${data?.length || 0} records`);
        }
      } catch (batchError) {
        console.error('Exception during batch upload:', batchError);
      }
      
      // Delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Log final success count
    console.log(`Successfully uploaded ${successCount} out of ${supabaseDonors.length} donors`);
    
    return successCount;
  } catch (error) {
    console.error('Error pushing Indian donors to Supabase:', error);
    return 0;
  }
};

/**
 * Check if Indian donors exist in the database
 * @returns Promise that resolves with a boolean indicating if Indian donors exist
 */
export const checkIfIndianDonorsExist = async (): Promise<boolean> => {
  try {
    const { data, error, count } = await supabase
      .from('donors')
      .select('id', { count: 'exact' })
      .ilike('location', '%India%')
      .limit(1);
    
    if (error) {
      console.error('Error checking for Indian donors:', error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error checking for Indian donors:', error);
    return false;
  }
}; 