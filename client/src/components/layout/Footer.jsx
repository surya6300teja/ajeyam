import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Shown until the real categories load, and as a fallback if the request fails.
const FALLBACK_CATEGORIES = ['Ancient India', 'Medieval India'];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    api.categories
      .getAllCategories({ limit: 5 })
      .then((res) => {
        const data =
          res?.data?.data?.categories ||
          res?.data?.categories ||
          (Array.isArray(res?.data) ? res.data : []);
        if (active && Array.isArray(data) && data.length) {
          setCategories(data.slice(0, 5).map((c) => c.name).filter(Boolean));
        }
      })
      .catch(() => {/* keep fallback list */});
    return () => { active = false; };
  }, []);

  const categoryNames = categories.length ? categories : FALLBACK_CATEGORIES;

  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeMsg(null);
    try {
      const res = await api.subscribers.subscribe(email.trim());
      setSubscribeMsg({ type: 'success', text: res?.data?.message || 'Thank you for subscribing!' });
      setEmail('');
    } catch (err) {
      setSubscribeMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSubscribing(false);
    }
  };

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
              {categoryNames.map((name) => (
                <li key={name}>
                  <Link
                    to={`/blogs?category=${encodeURIComponent(name)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-serif">Subscribe</h3>
            <p className="mb-4 text-sm">Stay updated with our latest blogs and articles.</p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-md text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary whitespace-nowrap disabled:opacity-60"
              >
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            {subscribeMsg && (
              <p className={`mt-2 text-sm ${subscribeMsg.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                {subscribeMsg.text}
              </p>
            )}
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