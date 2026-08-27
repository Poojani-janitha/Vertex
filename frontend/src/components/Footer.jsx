import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-500 py-12 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Left Column: Brand Overview */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-lg bg-[#06402B] flex items-center justify-center font-bold text-white text-base shadow-sm">
              W
            </div>
            <span className="text-lg font-bold text-[#06402B] tracking-tight">WorkOra</span>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed">
            Connecting talented university students with businesses across Sri Lanka for verified shifts, gigs, and part-time jobs.
          </p>
        </div>

        {/* Second Column: Platform Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Jobs Board
              </Link>
            </li>
            <li>
              <Link to="/users" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Directory
              </Link>
            </li>
            <li>
              <Link to="/signup" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Register as Business
              </Link>
            </li>
          </ul>
        </div>

        {/* Third Column: Support & Connect */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/contact" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-600 hover:text-[#06402B] transition-colors">
                Help & Safety Hub
              </Link>
            </li>
          </ul>
        </div>

        {/* Fourth Column: Contact Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Direct Office</h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span>📍</span>
              <span>123 Colombo Rd, Colombo, LK</span>
            </li>
            <li>
              <a href="mailto:support@workora.lk" className="flex items-center gap-2 hover:text-[#06402B] transition-colors">
                <span>✉️</span>
                <span>support@workora.lk</span>
              </a>
            </li>
            <li>
              <a href="tel:+94112345678" className="flex items-center gap-2 hover:text-[#06402B] transition-colors">
                <span>📞</span>
                <span>+94 11 234 5678</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Copyright and Socials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>&copy; {new Date().getFullYear()} WorkOra Platform. All rights reserved.</span>
        
        <div className="flex items-center gap-5">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-[#06402B] font-semibold transition"
          >
            Facebook
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-[#06402B] font-semibold transition"
          >
            Twitter / X
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-[#06402B] font-semibold transition"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
