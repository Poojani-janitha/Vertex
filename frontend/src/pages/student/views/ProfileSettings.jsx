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
          <div className={`p-4 rounded-lg text-sm border ${
            message.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-red-900/30 text-red-300 border-red-800'
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
          <div className="flex flex-wrap gap-2 p-3 bg-gray-100 border border-gray-200 rounded-lg mb-3 min-h-[50px] items-center">
            {skillTags.length === 0 ? (
              <span className="text-gray-500 text-xs italic">No skills selected. Click recommendations below or type custom tags.</span>
            ) : (
              skillTags.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-[#06402B]/25 border border-[#06402B] text-blue-300 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="hover:text-red-400 font-bold focus:outline-none text-[10px] w-4 h-4 rounded-full flex items-center justify-center bg-blue-900/50 hover:bg-red-950/45 cursor-pointer"
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
              className="flex-grow bg-gray-100 text-[#06402B] border border-gray-850 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-[#06402B] transition-colors" 
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
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-gray-100/10 rounded-lg">
              {popularSkills.map((pSkill) => {
                const isSelected = skillTags.some(s => s.toLowerCase() === pSkill.toLowerCase());
                return (
                  <button
                    key={pSkill}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleAddSkill(pSkill)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                      isSelected 
                        ? 'bg-gray-850/55 text-gray-600 cursor-not-allowed border border-gray-200' 
                        : 'bg-gray-850 hover:bg-blue-950/20 text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-900/50 cursor-pointer'
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
              <div key={item.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-100/30 p-4 rounded-xl border border-gray-200/50 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer sm:w-28 select-none">
                  <input 
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={(e) => handleAvailabilityChange(idx, 'isAvailable', e.target.checked)}
                    className="form-checkbox text-blue-500 rounded focus:ring-blue-500 bg-gray-100 border-gray-200 h-5 w-5 cursor-pointer"
                  />
                  <span className={`font-semibold text-xs ${item.isAvailable ? 'text-[#06402B]' : 'text-gray-500'}`}>{item.dayOfWeek}</span>
                </label>

                <div className="flex items-center gap-2 flex-grow sm:justify-end">
                  <input 
                    type="time"
                    disabled={!item.isAvailable}
                    value={item.startTime}
                    onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                    className="bg-gray-805 border border-gray-850 text-[#06402B] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#06402B] disabled:opacity-20 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 text-xs">to</span>
                  <input 
                    type="time"
                    disabled={!item.isAvailable}
                    value={item.endTime}
                    onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                    className="bg-gray-805 border border-gray-850 text-[#06402B] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#06402B] disabled:opacity-20 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-[#06402B] hover:bg-[#0a5c3f] text-white font-semibold py-2.5 px-6 rounded-lg transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
        >
          {updating ? 'Saving changes...' : 'Save Profile & Schedule'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
