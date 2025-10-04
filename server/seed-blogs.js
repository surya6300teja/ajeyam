const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const Blog = require('./src/models/Blog');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const sampleBlogContent = `
<p>This is a sample blog post created by the seeding script. It contains some formatted content to demonstrate the rich text capabilities.</p>

<h2>Heading Level 2</h2>

<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>

<h3>Heading Level 3</h3>

<p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em> and <a href="#">a link</a>.</p>

<ul>
  <li>Unordered list item 1</li>
  <li>Unordered list item 2</li>
  <li>Unordered list item 3</li>
</ul>

<ol>
  <li>Ordered list item 1</li>
  <li>Ordered list item 2</li>
  <li>Ordered list item 3</li>
</ol>

<blockquote>
  <p>This is a blockquote. It can contain multiple paragraphs.</p>
</blockquote>

<p>Thank you for reading this sample blog post!</p>
`;

const seedFeaturedBlogs = async () => {
  try {
    // Check for existing blogs
    const existingBlogsCount = await Blog.countDocuments();
    console.log(`Found ${existingBlogsCount} existing blogs`);
    
    // Only add featured blogs if there are less than 3
    const featuredBlogsCount = await Blog.countDocuments({ isFeatured: true, status: 'published' });
    console.log(`Found ${featuredBlogsCount} existing featured blogs`);
    
    if (featuredBlogsCount >= 3) {
      console.log('Already have at least 3 featured blogs. No need to create more.');
      return;
    }
    
    // Find a category (or create a default one)
    let category = await Category.findOne();
    
    if (!category) {
      console.log('No categories found. Creating a default category.');
      category = await Category.create({
        name: 'Ancient India',
        slug: 'ancient-india',
        description: 'Exploring the rich history of ancient India'
      });
    }
    
    // Find an admin user (or create a default one)
    let author = await User.findOne({ role: 'admin' });
    
    if (!author) {
      console.log('No admin user found. Creating a default admin user.');
      author = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'admin'
      });
    }
    
    // Sample blog data
    const blogTitles = [
      'The Forgotten Temples of Hampi',
      'Ashoka the Great: The Emperor Who Renounced Violence',
      "The Salt March: Gandhi's Revolutionary Protest",
      'The Majestic Forts of Rajasthan',
      'Unveiling the Mysteries of Ajanta Caves'
    ];
    
    const blogsToCreate = 3 - featuredBlogsCount;
    console.log(`Creating ${blogsToCreate} new featured blogs`);
    
    for (let i = 0; i < blogsToCreate; i++) {
      const blogData = {
        title: blogTitles[i],
        slug: blogTitles[i].toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
        summary: `This is a sample featured blog post about ${blogTitles[i].toLowerCase()} created by the seeding script.`,
        content: sampleBlogContent,
        coverImage: `https://source.unsplash.com/random/1200x800?${encodeURIComponent(blogTitles[i].split(':')[0])}`,
        author: author._id,
        category: category._id,
        tags: ['History', 'India', 'Featured'],
        readTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      };
      
      const blog = await Blog.create(blogData);
      console.log(`Created blog: ${blog.title} (${blog._id})`);
    }
    
    console.log('Featured blogs seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding featured blogs:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Add a function to make existing blogs featured
const makeBlogsFeatured = async () => {
  try {
    // First try to mark existing blogs as featured
    const unpublishedBlogs = await Blog.find({ 
      status: { $ne: 'published' } 
    }).limit(3);
    
    console.log(`Found ${unpublishedBlogs.length} unpublished blogs to update`);
    
    // Update these to published and featured
    for (const blog of unpublishedBlogs) {
      blog.status = 'published';
      blog.isFeatured = true;
      blog.publishedAt = blog.publishedAt || new Date();
      await blog.save();
      console.log(`Updated blog: ${blog.title} - status: ${blog.status}, featured: ${blog.isFeatured}`);
    }
    
    // Check how many published and featured blogs we have now
    const featuredBlogsCount = await Blog.countDocuments({ 
      isFeatured: true, 
      status: 'published' 
    });
    
    console.log(`After updates, found ${featuredBlogsCount} featured blogs`);
    
    // If still not enough, continue with creating new ones
    if (featuredBlogsCount < 3) {
      await seedFeaturedBlogs();
    } else {
      console.log('Successfully updated blogs to featured status');
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error updating blogs to featured status:', error);
    mongoose.connection.close();
  }
};

// Run the update function first
makeBlogsFeatured(); 