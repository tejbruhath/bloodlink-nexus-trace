export interface IndianCity {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
}

// Sample of major Indian cities with accurate coordinates
export const indianCities: IndianCity[] = [
  { name: "Mumbai", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777, population: 12478447 },
  { name: "Delhi", state: "Delhi", latitude: 28.7041, longitude: 77.1025, population: 11007835 },
  { name: "Bangalore", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, population: 8443675 },
  { name: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, population: 6993262 },
  { name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, population: 4646732 },
  { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, population: 4496694 },
  { name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, population: 3124458 },
  { name: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714, population: 5570585 },
  { name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, population: 3046163 },
  { name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462, population: 2815601 },
  { name: "Kanpur", state: "Uttar Pradesh", latitude: 26.4499, longitude: 80.3319, population: 2767031 },
  { name: "Nagpur", state: "Maharashtra", latitude: 21.1458, longitude: 79.0882, population: 2405665 },
  { name: "Indore", state: "Madhya Pradesh", latitude: 22.7196, longitude: 75.8577, population: 1994397 },
  { name: "Thane", state: "Maharashtra", latitude: 19.2183, longitude: 72.9781, population: 1841488 },
  { name: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126, population: 1798218 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185, population: 1728128 },
  { name: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, population: 1684222 },
  { name: "Vadodara", state: "Gujarat", latitude: 22.3072, longitude: 73.1812, population: 1670806 },
  { name: "Ghaziabad", state: "Uttar Pradesh", latitude: 28.6692, longitude: 77.4538, population: 1648395 },
  { name: "Ludhiana", state: "Punjab", latitude: 30.9010, longitude: 75.8573, population: 1618879 },
  { name: "Agra", state: "Uttar Pradesh", latitude: 27.1767, longitude: 78.0081, population: 1585704 },
  { name: "Nashik", state: "Maharashtra", latitude: 19.9975, longitude: 73.7898, population: 1486053 },
  { name: "Ranchi", state: "Jharkhand", latitude: 23.3441, longitude: 85.3097, population: 1126741 },
  { name: "Faridabad", state: "Haryana", latitude: 28.4089, longitude: 77.3178, population: 1404653 },
  { name: "Coimbatore", state: "Tamil Nadu", latitude: 11.0168, longitude: 76.9558, population: 1601438 },
  { name: "Srinagar", state: "Jammu and Kashmir", latitude: 34.0837, longitude: 74.7973, population: 1180570 },
  { name: "Amritsar", state: "Punjab", latitude: 31.6340, longitude: 74.8723, population: 1132383 },
  { name: "Kochi", state: "Kerala", latitude: 9.9312, longitude: 76.2673, population: 677381 },
  { name: "Varanasi", state: "Uttar Pradesh", latitude: 25.3176, longitude: 82.9739, population: 1201815 },
  { name: "Guwahati", state: "Assam", latitude: 26.1445, longitude: 91.7362, population: 957352 }
];

// Common Indian names for generating sample donor data
export const indianFirstNames = [
  "Aarav", "Aditi", "Akshay", "Amita", "Ananya", "Arjun", "Divya", "Gaurav", 
  "Ishaan", "Kavita", "Manish", "Neha", "Nikhil", "Pooja", "Priya", "Rahul", 
  "Ravi", "Sanjay", "Shreya", "Sunita", "Vikram", "Anjali", "Deepak", "Rajesh", 
  "Aishwarya", "Rohit", "Swati", "Vijay", "Meera", "Kiran"
];

export const indianLastNames = [
  "Patel", "Sharma", "Singh", "Kumar", "Iyer", "Agarwal", "Desai", "Gupta", 
  "Joshi", "Mehta", "Chatterjee", "Nair", "Shah", "Reddy", "Kapoor", "Verma", 
  "Das", "Bose", "Rao", "Khanna", "Chopra", "Menon", "Naidu", "Dutta", 
  "Malhotra", "Banerjee", "Mukherjee", "Roy", "Sethi", "Bhat"
];

// Common Indian addresses and patterns
export const indianAddressPatterns = [
  "{number}, {street}, {area}, {city}, {state}",
  "Flat No. {number}, {building}, {street}, {city}, {state}",
  "House No. {number}, {colony}, {area}, {city}, {state}",
  "{number}/{block}, {society}, {area}, {city}, {state}"
];

export const streetNames = [
  "MG Road", "Gandhi Road", "Nehru Street", "Subhash Marg", "Tilak Road", 
  "Station Road", "Temple Street", "Market Road", "College Road", "Park Street"
];

export const areas = [
  "Andheri", "Banjara Hills", "Civil Lines", "Defence Colony", "Egmore", 
  "Frazer Town", "Gandhinagar", "Hauz Khas", "Indiranagar", "Jubilee Hills"
];

export const colonies = [
  "Adarsh Nagar", "Bhagat Singh Colony", "Chanakyapuri", "Dadar Colony", 
  "Emerald Colony", "Friends Colony", "Green Park", "Himgiri Colony", "Indira Nagar"
];

export const societies = [
  "Aastha Apartments", "Bharat Vihar", "Chandralok Society", "Dwaraka Apartments", 
  "Everest Heights", "Friends Enclave", "Galaxy Apartments", "Harmony Heights"
];

// Generate a random Indian phone number
export const generateIndianPhoneNumber = (): string => {
  const operators = ["9", "8", "7", "6"];
  const randomOperator = operators[Math.floor(Math.random() * operators.length)];
  let number = randomOperator;
  
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10);
  }
  
  return `+91${number}`;
};

// Generate a random Indian address
export const generateIndianAddress = (city: string, state: string): string => {
  const pattern = indianAddressPatterns[Math.floor(Math.random() * indianAddressPatterns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  const block = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const colony = colonies[Math.floor(Math.random() * colonies.length)];
  const society = societies[Math.floor(Math.random() * societies.length)];
  const building = `${indianLastNames[Math.floor(Math.random() * indianLastNames.length)]} ${
    ["Apartments", "Heights", "Towers", "Residency", "House", "Villa", "Enclave"][Math.floor(Math.random() * 7)]
  }`;
  
  return pattern
    .replace("{number}", number.toString())
    .replace("{block}", block)
    .replace("{street}", street)
    .replace("{area}", area)
    .replace("{colony}", colony)
    .replace("{society}", society)
    .replace("{building}", building)
    .replace("{city}", city)
    .replace("{state}", state);
}; 