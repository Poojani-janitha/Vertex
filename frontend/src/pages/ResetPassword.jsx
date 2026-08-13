import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setError(null);
    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${id}/${token}`, { newPassword: password });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
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
            Create New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Please enter your new password below.
          </p>
        </div>
        
        {message ? (
          <div className="mt-8 text-center animate-fade-in">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-xl text-sm mb-4">
              {message}
            </div>
            <p className="text-sm text-gray-500 mb-4">Redirecting you to login...</p>
            <Link to="/login" className="font-semibold text-[#06402B] hover:text-[#0a5c3f] transition-colors">
              Go to Login Now
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
                <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Resetting...
                  </div>
                ) : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
