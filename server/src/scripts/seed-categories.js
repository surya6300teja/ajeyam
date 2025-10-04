const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import the Category model
const Category = require('../models/Category');

// Predefined categories for Indian history
const categories = [
  {
    name: 'Medieval India',
    description: 'History spanning from post-Gupta period to Mughal decline (550 CE - 1750 CE)',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada',
    order: 2,
    isActive: true
  },
  {
    name: 'Colonial Era',
    description: 'History of India during British colonial rule (1750 CE - 1947 CE)',
    imageUrl: 'https://images.unsplash.com/photo-1566054757865-8eaad372f7b9',
    order: 3,
    isActive: true
  },
  {
    name: 'Independence Movement',
    description: 'History of India\'s struggle for independence from British rule',
    imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c',
    order: 4,
    isActive: true
  },
  {
    name: 'Post-Independence',
    description: 'History of India after gaining independence (1947 CE - Present)',
    imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c',
    order: 5,
    isActive: true
  },
  {
    name: 'Art and Architecture',
    description: 'History of Indian art, architecture, sculptures, and monuments',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
    order: 6,
    isActive: true
  },
  {
    name: 'Religious History',
    description: 'History of various religions and spiritual traditions in India',
    imageUrl: 'https://images.unsplash.com/photo-1470075801209-17f9ec0cada6',
    order: 7,
    isActive: true
  },
  {
    name: 'Cultural History',
    description: 'History of Indian traditions, festivals, cuisines, and cultural practices',
    imageUrl: 'https://images.unsplash.com/photo-1544157503-562357ba8c7a',
    order: 8,
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return false;
  }
};

// Seed categories to database
const seedCategories = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // First, check if categories exist
    const existingCategoriesCount = await Category.countDocuments();
    console.log(`Found ${existingCategoriesCount} existing categories`);

    if (existingCategoriesCount > 0) {
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        console.log('Categories already exist in the database. Use --force to override.');
        await mongoose.connection.close();
        return;
      }
      console.log('Force flag detected. Deleting existing categories...');
      await Category.deleteMany({});
    }

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`Successfully added ${insertedCategories.length} categories:`);
    
    // Display categories
    insertedCategories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat._id})`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeding function
seedCategories(); 