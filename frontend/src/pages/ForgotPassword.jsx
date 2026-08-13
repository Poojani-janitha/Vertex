import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [resetLink, setResetLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setResetLink(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      // For development/testing: show the reset link directly
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_15px_40px_rgba(6,64,43,0.12)] border border-gray-100 p-10 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#06402B] to-[#0a5c3f]"></div>

        <div>
          <h2 className="text-center text-3xl font-extrabold text-[#06402B] tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {message ? (
          <div className="mt-8 text-center animate-fade-in">
             <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-xl text-sm mb-4">
              {message}
            </div>
            
            {resetLink && (
              <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-xl text-left shadow-inner">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Testing Inbox View
                </p>
                <p className="text-xs text-blue-500 mb-2">The system successfully sent an email! Since this is a development environment, you can click the link below to view the email in a testing inbox exactly as the user would see it:</p>
                <a href={resetLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-700 underline break-all hover:text-blue-800 transition-colors">
                  Open Email Preview
                </a>
              </div>
            )}

            <Link to="/login" className="font-semibold text-[#06402B] hover:text-[#0a5c3f] transition-colors">
              Return to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Email address</label>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${
                  loading ? 'bg-[#06402B]/70 cursor-not-allowed' : 'bg-[#06402B] hover:bg-[#053020] hover:shadow-xl hover:-translate-y-0.5'
                } transition-all duration-200`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : 'Send Reset Link'}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-[#06402B] transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
