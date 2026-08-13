import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = 
    location.pathname.startsWith('/community') || 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/admin');

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
