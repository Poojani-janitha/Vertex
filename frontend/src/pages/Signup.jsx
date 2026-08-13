import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const navigate = useNavigate();
  
  // General Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [phone, setPhone] = useState('');

  // Employer Specific Fields
  const [accountType, setAccountType] = useState('individual');
  const [individualIdNo, setIndividualIdNo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyRegNo, setCompanyRegNo] = useState('');

  // State
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone
      };

      if (role === 'employer') {
        payload.accountType = accountType;
        if (accountType === 'individual') {
          payload.individualIdNo = individualIdNo;
        } else {
          payload.companyName = companyName;
          payload.companyRegNo = companyRegNo;
        }
      }

      const response = await api.post('/auth/register', payload);
      
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
      setError(err.response?.data?.message || 'Failed to sign up. Please try again.');
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
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#06402B] hover:text-[#0a5c3f] transition-colors">
              Log in here
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center animate-fade-in">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            {/* Role Selection */}
            <div className="flex justify-center space-x-6 mb-8">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="role" 
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio text-[#06402B] focus:ring-[#06402B] bg-white border-gray-300" 
                />
                <span className={`font-semibold transition-colors ${role === 'student' ? 'text-[#06402B]' : 'text-gray-400 group-hover:text-gray-600'}`}>Student</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="role" 
                  value="employer"
                  checked={role === 'employer'}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio text-[#06402B] focus:ring-[#06402B] bg-white border-gray-300" 
                />
                <span className={`font-semibold transition-colors ${role === 'employer' ? 'text-[#06402B]' : 'text-gray-400 group-hover:text-gray-600'}`}>Employer</span>
              </label>
            </div>

            {/* General Fields */}
            <div>
              <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Phone Number (Optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
            </div>

            {/* Employer Specific Fields */}
            {role === 'employer' && (
              <div className="pt-6 mt-6 border-t border-gray-200 space-y-5 animate-fade-in">
                <h3 className="text-xs font-extrabold text-[#0a5c3f] uppercase tracking-widest text-center">Employer Verification Details</h3>
                
                <div>
                  <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Account Type</label>
                  <select 
                    value={accountType} 
                    onChange={(e) => setAccountType(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                </div>

                {accountType === 'individual' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">ID Number</label>
                    <input type="text" required value={individualIdNo} onChange={(e) => setIndividualIdNo(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Company Name</label>
                      <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#06402B] uppercase tracking-wider mb-2">Company Registration Number</label>
                      <input type="text" required value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06402B]/50 focus:border-[#06402B] transition-all sm:text-sm" />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
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
                  Creating Account...
                </div>
              ) : 'Sign Up for Vertex'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
