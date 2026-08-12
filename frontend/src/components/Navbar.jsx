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
      ? 'text-white border-b-2 border-blue-500 pb-1 font-semibold'
      : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500 pb-1 transition-colors duration-200';
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Vertex
              </span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-6">
                <Link to="/" className={getLinkClass('/')}>Home</Link>
                <Link to="/jobs" className={getLinkClass('/jobs')}>Jobs Board</Link>
                <Link to="/users" className={getLinkClass('/users')}>Directory</Link>
                {user && user.role === 'student' && (
                  <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
                )}
                {user && user.role === 'employer' && (
                  <Link to="/community" className={getLinkClass('/community')}>Employer Panel</Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">
                    Logged in as <strong className="text-white">{user.name}</strong>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border border-gray-600 hover:bg-red-900/50 hover:border-red-500 transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border border-gray-600 hover:bg-gray-700 transition">
                    Log in
                  </Link>
                  <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition transform hover:scale-105">
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
