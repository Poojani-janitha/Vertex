import React, { useState } from 'react';
import api from '../../../api/axios';

const ProfileSettings = ({ user, bio: initialBio, skills: initialSkills, availability: initialAvailability, onUpdate }) => {
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState(initialSkills);
  const [availability, setAvailability] = useState(initialAvailability);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAvailabilityChange = (dayIndex, field, value) => {
    setAvailability(prev => prev.map((item, idx) => {
      if (idx === dayIndex) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);
    try {
      // 1. Save profile (bio & skills)
      const profilePromise = api.put('/profiles/my-profile', { bio, skills });

      // 2. Save availability list
      const formattedAvailability = availability.map(item => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.isAvailable ? item.startTime : null,
        endTime: item.isAvailable ? item.endTime : null,
        isAvailable: item.isAvailable
      }));
      const availabilityPromise = api.put('/availabilities/my-availability', formattedAvailability);

      const [profileRes, availabilityRes] = await Promise.all([profilePromise, availabilityPromise]);
      
      // Send updates back to main component
      onUpdate(profileRes.data, availabilityRes.data);
      setMessage({ type: 'success', text: 'Profile and availability schedule updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
        <p className="text-gray-400 text-sm">Manage your bio, skills, and weekly work availability schedule.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg text-sm border ${
            message.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-red-900/30 text-red-300 border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
            <input 
              type="text" 
              disabled 
              value={user?.email || ''} 
              className="w-full bg-gray-900 text-gray-500 border border-gray-800 rounded-lg px-4 py-2.5 text-xs cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Phone Number</label>
            <input 
              type="text" 
              disabled 
              value={user?.phone || 'Not provided'} 
              className="w-full bg-gray-900 text-gray-500 border border-gray-800 rounded-lg px-4 py-2.5 text-xs cursor-not-allowed" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Professional Bio</label>
          <textarea 
            rows="5"
            placeholder="Tell recruiters about yourself, what you study, and your career goals..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Your Skills</label>
          <input 
            type="text" 
            placeholder="React, CSS, SQL, Python (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
          />
          <span className="text-[10px] text-gray-500 mt-2 block">Separate skills with commas. Employers use these tags to filter applicants.</span>
        </div>

        {/* Weekly Availability Schedule */}
        <div className="pt-6 border-t border-gray-800 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Weekly Availability Schedule</h3>
            <p className="text-xs text-gray-400">Select the specific times you are free for work during the week.</p>
          </div>

          <div className="space-y-3">
            {availability.map((item, idx) => (
              <div key={item.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/30 p-4 rounded-xl border border-gray-800/50 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer sm:w-28 select-none">
                  <input 
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={(e) => handleAvailabilityChange(idx, 'isAvailable', e.target.checked)}
                    className="form-checkbox text-blue-500 rounded focus:ring-blue-500 bg-gray-800 border-gray-700 h-5 w-5 cursor-pointer"
                  />
                  <span className={`font-semibold text-xs ${item.isAvailable ? 'text-white' : 'text-gray-500'}`}>{item.dayOfWeek}</span>
                </label>

                <div className="flex items-center gap-2 flex-grow sm:justify-end">
                  <input 
                    type="time"
                    disabled={!item.isAvailable}
                    value={item.startTime}
                    onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                    className="bg-gray-805 border border-gray-850 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 text-xs">to</span>
                  <input 
                    type="time"
                    disabled={!item.isAvailable}
                    value={item.endTime}
                    onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                    className="bg-gray-805 border border-gray-850 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
        >
          {updating ? 'Saving changes...' : 'Save Profile & Schedule'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
