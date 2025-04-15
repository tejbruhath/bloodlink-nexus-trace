import { Donor, BloodType } from '@/lib/types';
import { calculateDistance } from '@/services/supabaseService';

/**
 * KNN (K-Nearest Neighbors) implementation for blood donor matching
 * This class provides methods to train the algorithm with datasets
 * and find closest donors based on location and blood type compatibility
 */
export class KNNModel {
  private donors: (Donor & { distance?: number })[] = [];
  private compatibilityMatrix: Record<BloodType, BloodType[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // O- is universal donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'], // AB+ is universal recipient
  };

  /**
   * Train the KNN model with a dataset of donors
   * @param donorDataset Array of donor data to train the model
   */
  public train(donorDataset: Donor[]): void {
    this.donors = [...donorDataset];
    console.log(`KNN model trained with ${this.donors.length} donors`);
  }

  /**
   * Add a single donor to the existing dataset
   * @param donor Donor to add to the dataset
   */
  public addDonor(donor: Donor): void {
    this.donors.push(donor);
  }

  /**
   * Remove a donor from the dataset by ID
   * @param donorId ID of the donor to remove
   */
  public removeDonor(donorId: string): void {
    this.donors = this.donors.filter(donor => donor.id !== donorId);
  }

  /**
   * Update a donor in the dataset
   * @param donorId ID of the donor to update
   * @param updatedData Updated donor data
   */
  public updateDonor(donorId: string, updatedData: Partial<Donor>): void {
    this.donors = this.donors.map(donor => 
      donor.id === donorId ? { ...donor, ...updatedData } : donor
    );
  }

  /**
   * Find k closest donors matching the recipient's blood type
   * @param recipientBloodType Blood type of the recipient
   * @param recipientLat Recipient's latitude
   * @param recipientLon Recipient's longitude
   * @param k Number of donors to return (default: 5)
   * @param considerCompatibility Whether to consider blood type compatibility (default: true)
   * @returns Array of k closest matching donors
   */
  public findClosestDonors(
    recipientBloodType: BloodType,
    recipientLat: number,
    recipientLon: number,
    k: number = 5,
    considerCompatibility: boolean = true
  ): Donor[] {
    if (this.donors.length === 0) {
      console.warn('KNN model is not trained with any data');
      return [];
    }

    // Filter by blood type compatibility if needed
    let eligibleDonors = this.donors;
    if (considerCompatibility) {
      const compatibleTypes = this.getCompatibleDonorTypes(recipientBloodType);
      eligibleDonors = this.donors.filter(donor => 
        compatibleTypes.includes(donor.bloodType)
      );
    }

    // Calculate distances
    const donorsWithDistance = eligibleDonors.map(donor => {
      const donorWithDistance = { ...donor };
      donorWithDistance.distance = this.calculateDistance(
        recipientLat, recipientLon,
        donor.latitude || 0, donor.longitude || 0
      );
      return donorWithDistance;
    });

    // Sort by distance and return k nearest
    const sortedDonors = donorsWithDistance.sort((a, b) => 
      (a.distance || Infinity) - (b.distance || Infinity)
    );

    return sortedDonors.slice(0, k);
  }

  /**
   * Calculate the distance between two points using the Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
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
   * @param deg Angle in degrees
   * @returns Angle in radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get blood types that can donate to the recipient's blood type
   * @param recipientType Blood type of the recipient
   * @returns Array of compatible donor blood types
   */
  private getCompatibleDonorTypes(recipientType: BloodType): BloodType[] {
    // Who can donate to this recipient?
    // Find all blood types where the recipient is in the canDonateTo array
    const compatibleTypes: BloodType[] = [];
    
    Object.entries(this.compatibilityMatrix).forEach(([donorType, canDonateTo]) => {
      if (canDonateTo.includes(recipientType)) {
        compatibleTypes.push(donorType as BloodType);
      }
    });
    
    return compatibleTypes;
  }

  /**
   * Get the current dataset size
   * @returns Number of donors in the dataset
   */
  public getDatasetSize(): number {
    return this.donors.length;
  }

  /**
   * Clear all data from the model
   */
  public clearData(): void {
    this.donors = [];
  }
}

// Create and export a singleton instance
export const knnModel = new KNNModel();

/**
 * Calculate haversine distance between two points
 * @param recipientLat Recipient latitude
 * @param recipientLon Recipient longitude
 * @param inventory Inventory items with donor coordinates
 * @param donors Array of donors
 * @returns Inventory items with distance property added
 */
export const calculateDistanceToInventory = (
  recipientLat: number,
  recipientLon: number,
  inventory: any[],
  donors: Donor[]
) => {
  return inventory.map(item => {
    const donor = donors.find(d => d.id === item.donorId);
    
    if (!donor || !donor.latitude || !donor.longitude) {
      return { ...item, distance: Infinity };
    }
    
    const distance = calculateDistance(
      recipientLat,
      recipientLon,
      donor.latitude,
      donor.longitude
    );
    
    return { ...item, distance };
  });
};
