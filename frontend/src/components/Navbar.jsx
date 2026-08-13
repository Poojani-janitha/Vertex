import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Sync login status on navigation
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
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'text-[#06402B] border-b-2 border-[#06402B] pb-1 font-bold'
      : 'text-gray-600 hover:text-[#06402B] hover:border-b-2 hover:border-gray-500 pb-1 transition-colors duration-200';
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-lg">
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
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">
                    Logged in as <strong className="text-[#06402B]">{user.name}</strong>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-[#06402B] px-3 py-2 rounded-md text-sm font-medium border border-gray-600 hover:bg-red-900/50 hover:border-red-500 transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-[#06402B] px-3 py-2 rounded-md text-sm font-medium border border-gray-600 hover:bg-gray-700 transition">
                    Log in
                  </Link>
                  <Link to="/signup" className="bg-[#06402B] hover:bg-[#0a5c3f] text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition transform hover:scale-105">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
