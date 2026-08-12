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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
              Log in here
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="flex justify-center space-x-4 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio text-blue-500 focus:ring-blue-500" 
                />
                <span className="text-gray-300 font-medium">Student</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="employer"
                  checked={role === 'employer'}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio text-blue-500 focus:ring-blue-500" 
                />
                <span className="text-gray-300 font-medium">Employer</span>
              </label>
            </div>

            {/* General Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number (Optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            {/* Employer Specific Fields */}
            {role === 'employer' && (
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Employer Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Type</label>
                  <select 
                    value={accountType} 
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                </div>

                {accountType === 'individual' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ID Number</label>
                    <input type="text" required value={individualIdNo} onChange={(e) => setIndividualIdNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                      <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Company Registration Number</label>
                      <input type="text" required value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
              } transition-colors shadow-lg`}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
