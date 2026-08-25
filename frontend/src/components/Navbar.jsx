import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync login status on navigation and close mobile menu
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (err) {
        console.error(err);
      }
    } else {
      setUser(null);
    }
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'text-[#06402B] border-b-2 border-[#06402B] pb-1 font-bold'
      : 'text-gray-600 hover:text-[#06402B] hover:border-b-2 hover:border-gray-500 pb-1 transition-colors duration-200';
  };

  const getMobileLinkClass = (path) => {
    return location.pathname === path
      ? 'block px-3 py-2 rounded-lg text-base font-bold bg-emerald-50 text-[#06402B]'
      : 'block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#06402B] transition';
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#06402B] flex items-center justify-center font-bold text-white text-lg shrink-0">W</div>
              <span className="text-2xl font-bold text-[#06402B]">
                WorkOra
              </span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-6">
                <Link to="/" className={getLinkClass('/')}>Home</Link>
                <Link to="/jobs" className={getLinkClass('/jobs')}>Jobs Board</Link>
                <Link to="/contact" className={getLinkClass('/contact')}>Contact Us</Link>
                {user && user.role === 'student' && (
                  <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
                )}
                {user && user.role === 'employer' && (
                  <Link to="/community" className={getLinkClass('/community')}>Employer Panel</Link>
                )}
                {user && user.role === 'admin' && (
                  <Link to="/admin" className={getLinkClass('/admin')}>Admin Dashboard</Link>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">
                    Logged in as <strong className="text-[#06402B]">{user.name}</strong>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-[#06402B] px-3.5 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition">
                    Log in
                  </Link>
                  <Link to="/signup" className="bg-[#06402B] hover:bg-[#0a5c3f] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-emerald-900/10 transition transform hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-[#06402B] hover:bg-gray-100 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-xl animate-fade-in">
          <div className="space-y-1">
            <Link to="/" className={getMobileLinkClass('/')}>Home</Link>
            <Link to="/jobs" className={getMobileLinkClass('/jobs')}>Jobs Board</Link>
            <Link to="/contact" className={getMobileLinkClass('/contact')}>Contact Us</Link>
            {user && user.role === 'student' && (
              <Link to="/dashboard" className={getMobileLinkClass('/dashboard')}>Student Dashboard</Link>
            )}
            {user && user.role === 'employer' && (
              <Link to="/community" className={getMobileLinkClass('/community')}>Employer Panel</Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className={getMobileLinkClass('/admin')}>Admin Dashboard</Link>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 px-3">
                  Signed in as <strong className="text-[#06402B]">{user.name}</strong> ({user.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  className="text-center px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-center px-4 py-2.5 rounded-xl bg-[#06402B] text-white text-sm font-semibold hover:bg-[#0a5c3f] shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
