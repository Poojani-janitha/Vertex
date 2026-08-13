import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-500 py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Column: Brand Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#06402B] flex items-center justify-center font-bold text-white text-lg">W</div>
            <span className="text-lg font-bold text-[#06402B] tracking-wider">WorkOra</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Connecting talented university students with businesses looking for contract, gig, and part-time resources.
          </p>
        </div>

        {/* Second Column: Platform Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-blue-500 transition-colors">Jobs Board</Link>
            </li>
            <li>
              <Link to="/users" className="hover:text-blue-500 transition-colors">Directory</Link>
            </li>
          </ul>
        </div>

        {/* Third Column: Support & Connect */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/contact" className="hover:text-blue-500 transition-colors">Contact Us</Link>
            </li>
            <li>
              <span className="text-gray-600 cursor-not-allowed">Terms of Service</span>
            </li>
            <li>
              <span className="text-gray-600 cursor-not-allowed">Privacy Policy</span>
            </li>
          </ul>
        </div>

        {/* Fourth Column: Contact Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Direct Office</h4>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>📍 123 Colombo Rd, Colombo, LK</li>
            <li>✉️ support@workora.com</li>
            <li>📞 +94 11 234 5678</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>&copy; {new Date().getFullYear()} WorkOra Platform. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="hover:text-gray-500 transition cursor-pointer">Facebook</span>
          <span className="hover:text-gray-500 transition cursor-pointer">Twitter</span>
          <span className="hover:text-gray-500 transition cursor-pointer">LinkedIn</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
