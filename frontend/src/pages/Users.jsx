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
        <h1 className="text-3xl font-bold text-white mb-2">User Directory</h1>
        <p className="text-gray-400">Browse registered students and employers on WorkOra.</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
          <div className="text-gray-500 text-5xl mb-4">👥</div>
          <h3 className="text-xl font-medium text-gray-300">No users found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col items-center text-center hover:bg-gray-750 hover:border-gray-600 transition-colors">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-indigo-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{user.name}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full mb-3 uppercase tracking-wider ${
                user.role === 'employer' ? 'bg-amber-900/50 text-amber-400' :
                user.role === 'admin' ? 'bg-red-900/50 text-red-400' :
                'bg-blue-900/50 text-blue-400'
              }`}>
                {user.role || 'Student'}
              </span>
              <p className="text-gray-400 text-sm w-full truncate">{user.email}</p>
              
              <button className="mt-6 w-full text-sm font-medium text-indigo-400 hover:text-indigo-300 py-2 border border-indigo-900/50 hover:border-indigo-500/30 rounded-lg transition-colors bg-indigo-950/20">
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
