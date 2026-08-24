import React, { useState } from 'react';
import api from '../../../api/axios';

const ProfileSettings = ({ user, bio: initialBio, skills: initialSkills, availability: initialAvailability, onUpdate }) => {
  const [bio, setBio] = useState(initialBio);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  // Skills Array & Recommendations list
  const getSkillsArray = (skillsStr) => skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(s => s !== '') : [];
  const [skillTags, setSkillTags] = useState(getSkillsArray(initialSkills));
  const [newSkillInput, setNewSkillInput] = useState('');

  const [availability, setAvailability] = useState(initialAvailability);

  const popularSkills = [
    'Social Media Management',
    'Customer Service',
    'Event Coordination',
    'Data Entry',
    'Content Writing',
    'Tutoring / Teaching',
    'Graphic Design',
    'Web Development',
    'Photography / Videography',
    'Research Assistance',
    'Catering / Food Service',
    'Cleaning / Housekeeping',
    'HTML',
    'CSS',
    'JavaScript',
    'React'
  ];

  const handleAddSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    // Check for duplicates case-insensitively
    const exists = skillTags.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSkillTags(prev => [...prev, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkillTags(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

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
      const skillsString = skillTags.join(', ');
      
      // 1. Save profile (bio & skills)
      const profilePromise = api.put('/profiles/my-profile', { bio, skills: skillsString });

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
        <h2 className="text-2xl font-bold text-[#06402B] mb-2">Profile Settings</h2>
        <p className="text-gray-500 text-sm">Manage your bio, skills, and weekly work availability schedule.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-sm border font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
            <input 
              type="text" 
              disabled 
              value={user?.email || ''} 
              className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-lg px-4 py-2.5 text-xs cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Phone Number</label>
            <input 
              type="text" 
              disabled 
              value={user?.phone || 'Not provided'} 
              className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-lg px-4 py-2.5 text-xs cursor-not-allowed" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Professional Bio</label>
          <textarea 
            rows="5"
            placeholder="Tell recruiters about yourself, what you study, and your career goals..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-gray-100 text-[#06402B] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#06402B] transition-colors" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Your Skills</label>
          
          {/* Active Skill Chips Container */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 min-h-[50px] items-center">
            {skillTags.length === 0 ? (
              <span className="text-gray-500 text-xs italic">No skills selected. Click recommendations below or type custom tags.</span>
            ) : (
              skillTags.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="hover:text-red-700 font-bold focus:outline-none text-[10px] w-4 h-4 rounded-full flex items-center justify-center bg-emerald-200/60 hover:bg-red-100 text-emerald-800 hover:text-red-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="Add custom skill (e.g. Docker, Photoshop)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkillInput);
                }
              }}
              className="flex-grow bg-gray-100 text-[#06402B] border border-gray-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-[#06402B] transition-colors" 
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Recommended Skills suggestion box */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Suggested Recommendations</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-gray-100/30 rounded-lg">
              {popularSkills.map((pSkill) => {
                const isSelected = skillTags.some(s => s.toLowerCase() === pSkill.toLowerCase());
                return (
                  <button
                    key={pSkill}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleAddSkill(pSkill)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                      isSelected 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                        : 'bg-white hover:bg-emerald-50 text-gray-600 hover:text-[#06402B] border border-gray-200 hover:border-emerald-300 cursor-pointer shadow-sm'
                    }`}
                  >
                    + {pSkill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Availability Schedule */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#06402B] mb-1">Weekly Availability Schedule</h3>
            <p className="text-xs text-gray-500">Select the specific times you are free for work during the week.</p>
          </div>

          <div className="space-y-3">
            {availability.map((item, idx) => (
              <div key={item.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                <label className="flex items-center space-x-3 cursor-pointer sm:w-28 select-none">
                  <input 
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={(e) => handleAvailabilityChange(idx, 'isAvailable', e.target.checked)}
                    className="form-checkbox text-[#06402B] rounded focus:ring-[#06402B] bg-gray-50 border-gray-300 h-5 w-5 cursor-pointer accent-[#06402B]"
                  />
                  <span className={`font-semibold text-xs ${item.isAvailable ? 'text-[#06402B]' : 'text-gray-400'}`}>{item.dayOfWeek}</span>
                </label>

                <div className="flex items-center gap-2 flex-grow sm:justify-end">
                  <input 
                    type="time"
                    disabled={!item.isAvailable}
                    value={item.startTime}
                    onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-[#06402B] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#06402B] disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 text-xs font-medium">to</span>
                  <input 
                    type="time"
                    disabled={!item.isAvailable}
                    value={item.endTime}
                    onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-[#06402B] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#06402B] disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-[#06402B] hover:bg-[#0a5c3f] text-white font-semibold py-3 px-6 rounded-xl transition transform hover:-translate-y-0.5 shadow-lg shadow-emerald-900/20"
        >
          {updating ? 'Saving changes...' : 'Save Profile & Schedule'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
