import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF7F4] px-4">
      <div className="text-center max-w-lg">
        <p className="font-devanagari text-primary text-lg mb-2">||क्षम्यताम्||</p>
        <h1 className="text-6xl font-serif font-bold text-amber-900 mb-4">404</h1>
        <h2 className="text-2xl font-serif text-amber-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you’re looking for doesn’t exist or may have moved. Let’s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors font-medium"
          >
            Back to Home
          </Link>
          <Link
            to="/blogs"
            className="inline-block px-6 py-3 border border-amber-900 text-amber-900 rounded-full hover:bg-amber-50 transition-colors font-medium"
          >
            Browse Blogs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
