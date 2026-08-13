import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboardView = location.pathname.startsWith('/community') || location.pathname.startsWith('/admin');

  if (isDashboardView) {
    return (
      <div className="min-h-screen bg-[#0e131f] text-gray-100 flex flex-col font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-900 border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Vertex Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
