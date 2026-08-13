import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save token and user details to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirect based on role
      if (response.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.role === 'employer') {
        navigate('/community');
      } else if (response.data.role === 'student') {
        navigate('/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
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
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#06402B] hover:text-[#0a5c3f] transition-colors">
              Create one now
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-gray-500 hover:text-[#06402B] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-gray-400 hover:text-[#06402B] transition-colors focus:outline-none p-1"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
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
                  Signing in...
                </div>
              ) : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
