import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Blogs', href: '/blogs', current: false },
  { name: 'Our Story', href: '/about', current: false },
  { name: 'Books', href: '/book-reviews', current: false },
  { name: 'Write', href: '/create-blog', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated, isAdmin } = useAuth();
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const goToCreateBlog = () => {
    setIsWriteModalOpen(false);
    navigate('/create-blog');
  };

  const goToCreateBookReview = () => {
    setIsWriteModalOpen(false);
    navigate('/create-book-review');
  };

  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-200">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo and Navigation */}
              <div className="flex flex-1 items-center justify-between sm:items-stretch">
                <div className="flex flex-shrink-0 items-center ml-8 sm:ml-0">
                  <Link to="/" className="flex items-center group">
                    <img
                      src="/logo.png"
                      alt="Ajeyam Logo"
                      className="h-10 w-10 sm:h-12 sm:w-12 mr-3 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:drop-shadow-sm will-change-transform"
                      style={{ transform: `rotate(${scrollY * 0.15}deg)` }}
                    />
                    <span className="text-2xl font-serif font-bold text-gray-900 transition-colors group-hover:text-gray-700">
                      ajeyam.in
                    </span>
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    item.name === 'Write' ? (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIsWriteModalOpen(true)}
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Admin
                        </Link>
                      )}
                      {/* Profile avatar link */}
                      <Link to="/profile" className="flex items-center group">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name || 'Profile'}
                            className="w-9 h-9 rounded-full object-cover border-2 border-primary group-hover:opacity-80 transition"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold border-2 border-primary">
                            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                item.name === 'Write' ? (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIsWriteModalOpen(true)}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              ))}
              {isAdmin && (
                <Disclosure.Button
                  as={Link}
                  to="/admin"
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Admin
                </Disclosure.Button>
              )}
            </div>
          </Disclosure.Panel>

          {/* Write Modal */}
          <Transition.Root show={isWriteModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsWriteModalOpen}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/30" />
              </Transition.Child>

              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0"
                    leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        What would you like to write?
                      </Dialog.Title>
                      <div className="mt-4 space-y-3">
                        <button
                          type="button"
                          onClick={goToCreateBlog}
                          className="w-full bg-black text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                        >
                          Create Blog
                        </button>
                        <button
                          type="button"
                          onClick={goToCreateBookReview}
                          className="w-full border border-gray-300 text-gray-900 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Create Book Review
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>
        </>
      )}
    </Disclosure>
  );
};

export default Header; 