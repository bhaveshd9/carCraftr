const mongoose = require('mongoose');
const Car = require('./models/Car');
require('dotenv').config();

const sampleCars = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    type: 'Sedan',
    description: 'The Toyota Camry is a mid-size sedan known for its reliability, comfort, and fuel efficiency.',
    basePrice: 26520,
    imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9',
    galleryImages: [
      'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9',
      'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
    ],
    variants: [
      {
        name: 'LE',
        price: 26520,
        specifications: {
          engine: '2.5L 4-Cylinder',
          horsepower: 203,
          torque: 184,
          transmission: 'Automatic',
          fuelType: 'Petrol',
          mpg: { city: 28, highway: 39 },
          acceleration: 7.5,
          topSpeed: 135,
          weight: 3310,
          dimensions: { length: 192.1, width: 72.4, height: 56.9 },
          cargoSpace: 15.1,
          seatingCapacity: 5,
          safetyFeatures: ['Toyota Safety Sense 2.5+', 'Pre-Collision System', 'Lane Tracing Assist'],
          infotainment: ['7-inch touchscreen', 'Apple CarPlay', 'Android Auto'],
          comfortFeatures: ['Dual-zone climate control', 'Power driver\'s seat', 'Keyless entry']
        },
        variantSpecificColors: [
          {
            name: 'Celestial Blue',
            code: '#1E90FF',
            imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
          }
        ]
      },
      {
        name: 'XLE',
        price: 31570,
        specifications: {
          engine: '2.5L 4-Cylinder',
          horsepower: 203,
          torque: 184,
          transmission: 'Automatic',
          fuelType: 'Petrol',
          mpg: { city: 28, highway: 39 },
          acceleration: 7.5,
          topSpeed: 135,
          weight: 3310,
          dimensions: { length: 192.1, width: 72.4, height: 56.9 },
          cargoSpace: 15.1,
          seatingCapacity: 5,
          safetyFeatures: ['Toyota Safety Sense 2.5+', 'Pre-Collision System', 'Lane Tracing Assist'],
          infotainment: ['9-inch touchscreen', 'Apple CarPlay', 'Android Auto', 'JBL Premium Audio'],
          comfortFeatures: ['Dual-zone climate control', 'Power driver\'s seat', 'Keyless entry', 'Leather-trimmed seats']
        },
        variantSpecificColors: [
          {
            name: 'Ruby Flare Pearl',
            code: '#E0115F',
            imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
          }
        ]
      }
    ],
    generalColors: [
      {
        name: 'Ice Edge',
        code: '#F0F8FF',
        imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
      },
      {
        name: 'Midnight Black',
        code: '#000000',
        imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
      }
    ],
    reviews: [
      {
        rating: 4.5,
        comment: 'Great fuel economy and comfortable ride. Perfect for daily commuting.',
        userName: 'John Doe',
        date: new Date('2024-01-15')
      },
      {
        rating: 4.0,
        comment: 'Reliable and spacious. The infotainment system could be better.',
        userName: 'Jane Smith',
        date: new Date('2024-02-01')
      }
    ]
  },
  {
    make: 'Honda',
    model: 'CR-V',
    year: 2024,
    type: 'SUV',
    description: 'The Honda CR-V is a compact SUV that offers a perfect blend of practicality, comfort, and efficiency.',
    basePrice: 29500,
    imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9',
    galleryImages: [
      'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9',
      'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
    ],
    variants: [
      {
        name: 'LX',
        price: 29500,
        specifications: {
          engine: '1.5L Turbo 4-Cylinder',
          horsepower: 190,
          torque: 179,
          transmission: 'CVT',
          fuelType: 'Petrol',
          mpg: { city: 28, highway: 34 },
          acceleration: 8.2,
          topSpeed: 124,
          weight: 3373,
          dimensions: { length: 182.1, width: 73.0, height: 66.5 },
          cargoSpace: 39.2,
          seatingCapacity: 5,
          safetyFeatures: ['Honda Sensing', 'Collision Mitigation Braking', 'Road Departure Mitigation'],
          infotainment: ['7-inch touchscreen', 'Apple CarPlay', 'Android Auto'],
          comfortFeatures: ['Dual-zone climate control', 'Power driver\'s seat', 'Keyless entry']
        },
        variantSpecificColors: [
          {
            name: 'Sonic Gray Pearl',
            code: '#808080',
            imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
          }
        ]
      },
      {
        name: 'EX-L',
        price: 34500,
        specifications: {
          engine: '1.5L Turbo 4-Cylinder',
          horsepower: 190,
          torque: 179,
          transmission: 'CVT',
          fuelType: 'Petrol',
          mpg: { city: 28, highway: 34 },
          acceleration: 8.2,
          topSpeed: 124,
          weight: 3373,
          dimensions: { length: 182.1, width: 73.0, height: 66.5 },
          cargoSpace: 39.2,
          seatingCapacity: 5,
          safetyFeatures: ['Honda Sensing', 'Collision Mitigation Braking', 'Road Departure Mitigation'],
          infotainment: ['9-inch touchscreen', 'Apple CarPlay', 'Android Auto', 'Premium Audio'],
          comfortFeatures: ['Dual-zone climate control', 'Power driver\'s seat', 'Keyless entry', 'Leather-trimmed seats']
        },
        variantSpecificColors: [
          {
            name: 'Crystal Black Pearl',
            code: '#000000',
            imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
          }
        ]
      }
    ],
    generalColors: [
      {
        name: 'Platinum White Pearl',
        code: '#FFFFFF',
        imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
      },
      {
        name: 'Radiant Red Metallic',
        code: '#FF0000',
        imageUrl: 'https://images.unsplash.com/photo-1617469767053-3fef74c1d3f9'
      }
    ],
    reviews: [
      {
        rating: 4.8,
        comment: 'Excellent SUV with great fuel economy and plenty of cargo space.',
        userName: 'Mike Johnson',
        date: new Date('2024-01-20')
      },
      {
        rating: 4.2,
        comment: 'Comfortable ride and good technology features. Could use more power.',
        userName: 'Sarah Wilson',
        date: new Date('2024-02-10')
      }
    ]
  }
];

const populateDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Car.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data
    const result = await Car.insertMany(sampleCars);
    console.log(`Successfully inserted ${result.length} cars`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
};

// Run the population script
populateDatabase(); 