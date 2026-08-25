import { useState, useEffect } from 'react';
import api from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
        <h3 className="font-bold">Error Loading Users</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#06402B] mb-2">User Directory</h1>
        <p className="text-gray-500">Browse registered students and employers on WorkOra.</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-white/30 rounded-2xl border border-gray-200 border-dashed">
          <div className="text-gray-500 text-5xl mb-4">👥</div>
          <h3 className="text-xl font-medium text-gray-600">No users found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center hover:border-emerald-600/40 hover:shadow-xl hover:shadow-green-900/10 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-[#06402B] to-[#0a5c3f] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-green-900/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-[#06402B] mb-1">{user.name}</h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wider border ${
                user.role === 'employer' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {user.role || 'Student'}
              </span>
              <p className="text-gray-500 text-sm w-full truncate">{user.email}</p>
              
              <button className="mt-6 w-full text-sm font-semibold text-[#06402B] hover:text-white py-2.5 border border-[#06402B]/30 hover:bg-[#06402B] rounded-xl transition-all shadow-sm">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
