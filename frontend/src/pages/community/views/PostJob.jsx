import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click hook to update coordinates
const LocationSelector = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

// Component to dynamically pan map to new search coordinate
const MapPan = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.setView(pos, 16);
    }
  }, [pos, map]);
  return null;
};

const PostJob = ({ onJobCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [requiredEmployees, setRequiredEmployees] = useState('1');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Database skills list & selection states
  const [dbSkills, setDbSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Default map position: Faculty of Technology, University of Ruhuna (6.0617, 80.5694)
  const [position, setPosition] = useState([6.0617, 80.5694]); 
  
  // Geocoding search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch skills from database
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get('/skills');
        setDbSkills(response.data);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }
    };
    fetchSkills();
  }, []);

  // Search OpenStreetMap Nominatim API - Restricted strictly to Sri Lanka (countrycodes=lk)
  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingMap(true);
    setSearchFeedback(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=lk&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords = [parseFloat(lat), parseFloat(lon)];
        setPosition(newCoords);
        setLocationName(display_name); // Autofill location description
        setSearchFeedback({ type: 'success', text: `Found: ${display_name.split(',')[0]}` });
      } else {
        setSearchFeedback({ type: 'error', text: 'Location not found in Sri Lanka. Try checking the name.' });
      }
    } catch (err) {
      setSearchFeedback({ type: 'error', text: 'Failed to connect to map search API.' });
    } finally {
      setIsSearchingMap(false);
    }
  };

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/jobs', {
        title,
        description,
        skillsNeeded: selectedSkills.join(', '), // Send joined skills string
        payAmount: parseFloat(payAmount),
        requiredEmployees: parseInt(requiredEmployees),
        locationName,
        latitude: position[0],
        longitude: position[1],
        startTime,
        endTime
      });
      onJobCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please check verification status and inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Triggers native browser datepicker popup
  const handleShowCalendar = (e) => {
    try {
      e.target.showPicker();
    } catch (err) {
      console.warn('Native datepicker not supported or blocked:', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-lg animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-[#06402B]">Create a New Job Post</h3>
        <p className="text-xs text-gray-500">Fill in details and pin location coordinates on the map.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Event Coordinator Assistant" 
              className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06402B]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pay Amount (LKR/Hour)</label>
            <input 
              type="number" 
              required 
              step="0.01"
              placeholder="15.00" 
              className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06402B]"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Required Candidates (Vacancies)</label>
            <input 
              type="number" 
              required 
              min="1"
              placeholder="1" 
              className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06402B]"
              value={requiredEmployees}
              onChange={(e) => setRequiredEmployees(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <textarea 
            rows="3" 
            placeholder="Write details about the shift tasks, requirements, dress code..." 
            className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06402B]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Date and Calendar Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              📅 Start Date & Time
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm pointer-events-none">📅</span>
              <input 
                type="datetime-local" 
                required
                className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#06402B] calendar-picker-indicator cursor-pointer"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={handleShowCalendar}
                onFocus={handleShowCalendar}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              📅 End Date & Time
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm pointer-events-none">📅</span>
              <input 
                type="datetime-local" 
                required
                className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#06402B] calendar-picker-indicator cursor-pointer"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={handleShowCalendar}
                onFocus={handleShowCalendar}
              />
            </div>
          </div>
        </div>

        {/* REQUIRED SKILLS SELECTABLE BADGES (New) */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Required Skills (Select multiple)</label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-100/40 border border-gray-200 rounded-lg">
            {dbSkills.length === 0 ? (
              <span className="text-xs text-gray-500 animate-pulse">Loading skills list...</span>
            ) : (
              dbSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.name);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#06402B] border-[#06402B] text-[#06402B] shadow-md shadow-blue-500/20'
                        : 'bg-gray-100 border-gray-200 text-gray-500 hover:border-gray-650'
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Location Name / Venue description</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Faculty Lecture Hall A" 
            className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06402B]"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>

        {/* MAP LOCATION SEARCH INPUT */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Search Map Location (Sri Lanka)</label>
          <div className="flex gap-2 mb-2">
            <input 
              type="text"
              placeholder="Type town, university, or venue (e.g. Faculty of Technology, Ruhuna)..." 
              className="flex-grow bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06402B]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleMapSearch}
              disabled={isSearchingMap}
              className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              {isSearchingMap ? 'Searching...' : '🔍 Find on Map'}
            </button>
          </div>

          {searchFeedback && (
            <div className={`text-xs mb-3 ${
              searchFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {searchFeedback.text}
            </div>
          )}

          {/* Leaflet map selector - Height increased to h-[450px] */}
          <div className="h-[450px] rounded-lg overflow-hidden border border-gray-200 relative z-0">
            <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationSelector position={position} setPosition={setPosition} />
              <MapPan pos={position} />
            </MapContainer>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}</div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-[#06402B] hover:bg-[#0a5c3f] text-white font-semibold py-2.5 rounded-lg transition"
        >
          {submitting ? 'Creating job...' : 'Post Job opportunity'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
