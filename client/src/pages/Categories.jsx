import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data for categories
const categories = [
  {
    id: 1,
    name: 'Ancient India',
    description: 'Explore the rich heritage of Ancient Indian civilization, from the Indus Valley to the Gupta Empire.',
    imageUrl: 'https://images.unsplash.com/photo-1566136374023-df9e4de64ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 24,
  },
  {
    id: 2,
    name: 'Medieval India',
    description: 'Discover the fascinating world of Medieval Indian kingdoms, the Delhi Sultanate, and the Mughal Empire.',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 18,
  },
  {
    id: 3,
    name: 'Colonial Era',
    description: 'Learn about the British colonial period in India and its profound impact on the nation.',
    imageUrl: 'https://images.unsplash.com/photo-1600020972626-96a0a7571e83?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 15,
  },
  {
    id: 4,
    name: 'Independence Movement',
    description: 'The struggle for freedom and the inspiring figures who led India to independence.',
    imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 22,
  },
  {
    id: 5,
    name: 'Modern History',
    description: 'Post-independence India and the challenges and triumphs of building a new nation.',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 16,
  },
  {
    id: 6,
    name: 'Art & Culture',
    description: 'The rich artistic and cultural traditions that have shaped Indian identity through the ages.',
    imageUrl: 'https://images.unsplash.com/photo-1585136917897-92bc92cc6d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 12,
  },
  {
    id: 7,
    name: 'Archaeology',
    description: 'Archaeological discoveries that have illuminated the mysteries of India\'s past.',
    imageUrl: 'https://images.unsplash.com/photo-1594402905608-d19a7f3c9f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 9,
  },
  {
    id: 8,
    name: 'Religion & Philosophy',
    description: 'The spiritual traditions and philosophical systems that originated in the Indian subcontinent.',
    imageUrl: 'https://images.unsplash.com/photo-1581888517319-2fb4e77011a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    count: 14,
  },
];

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="py-12 bg-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif text-text mb-4">Explore History by Categories</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the rich tapestry of Indian history through our curated categories. 
            Each section offers deep insights into the different eras and aspects of India's past.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <Link 
                key={category.id} 
                to={`/blogs?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform group-hover:scale-105">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold font-serif text-text group-hover:text-primary">
                        {category.name}
                      </h3>
                      <span className="text-sm font-medium text-primary bg-primary-light px-2 py-1 rounded-full">
                        {category.count} blogs
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="mt-auto text-primary font-medium group-hover:text-primary-dark">
                      Explore Category →
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No categories found</h3>
              <p className="text-gray-500">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories; 