import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-dark text-text-light py-10">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link to="/" className="text-2xl font-bold font-serif text-accent">Ajeyam</Link>
            <p className="mt-4 text-sm">
              Unraveling the History of India, One Story at a Time. Discover the rich cultural heritage and historical significance of the Indian subcontinent
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-serif">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/blogs" className="hover:text-primary transition-colors">All Blogs</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-serif">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/categories/ancient-india" className="hover:text-primary transition-colors">Ancient India</Link></li>
              <li><Link to="/categories/medieval-india" className="hover:text-primary transition-colors">Medieval India</Link></li>
              <li><Link to="/categories/colonial-era" className="hover:text-primary transition-colors">Colonial Era</Link></li>
              <li><Link to="/categories/independence-movement" className="hover:text-primary transition-colors">Independence Movement</Link></li>
              <li><Link to="/categories/modern-history" className="hover:text-primary transition-colors">Modern History</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-serif">Subscribe</h3>
            <p className="mb-4 text-sm">Stay updated with our latest blogs and articles.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-md text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© {currentYear} Ajeyam. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/contact" className="text-sm hover:text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 