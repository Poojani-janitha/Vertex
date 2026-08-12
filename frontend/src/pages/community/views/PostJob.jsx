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
      map.setView(pos, 15);
    }
  }, [pos, map]);
  return null;
};

const PostJob = ({ onJobCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [position, setPosition] = useState([6.9271, 79.8612]); // default Colombo
  
  // Geocoding search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Search OpenStreetMap Nominatim API (Free, no keys needed)
  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingMap(true);
    setSearchFeedback(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords = [parseFloat(lat), parseFloat(lon)];
        setPosition(newCoords);
        setLocationName(display_name); // Autofill location name input
        setSearchFeedback({ type: 'success', text: `Found: ${display_name.split(',')[0]}` });
      } else {
        setSearchFeedback({ type: 'error', text: 'Location not found on map. Try checking the name.' });
      }
    } catch (err) {
      setSearchFeedback({ type: 'error', text: 'Failed to connect to map search API.' });
    } finally {
      setIsSearchingMap(false);
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
        skillsNeeded,
        payAmount: parseFloat(payAmount),
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

  return (
    <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 space-y-6 shadow-lg animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-white">Create a New Job Post</h3>
        <p className="text-xs text-gray-400">Fill in details and pin location coordinates on the map.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Job Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Event Coordinator Assistant" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Pay Amount ($/Hour)</label>
            <input 
              type="number" 
              required 
              step="0.01"
              placeholder="15.00" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
          <textarea 
            rows="3" 
            placeholder="Write details about the shift tasks, requirements, dress code..." 
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Date and Calendar Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              📅 Start Date & Time <span className="text-[10px] text-blue-400 font-normal">(Click calendar icon)</span>
            </label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 calendar-picker-indicator"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              📅 End Date & Time <span className="text-[10px] text-blue-400 font-normal">(Click calendar icon)</span>
            </label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 calendar-picker-indicator"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Required Skills (Comma separated)</label>
            <input 
              type="text" 
              placeholder="Communication, Teamwork" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={skillsNeeded}
              onChange={(e) => setSkillsNeeded(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Location Name / Venue description</label>
            <input 
              type="text" 
              required
              placeholder="e.g. University Hall A" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
        </div>

        {/* MAP LOCATION SEARCH INPUT */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">Search Map Location</label>
          <div className="flex gap-2 mb-2">
            <input 
              type="text"
              placeholder="Type town, university, or building (e.g. Kelaniya University)..." 
              className="flex-grow bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleMapSearch}
              disabled={isSearchingMap}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
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

          {/* Leaflet map selector */}
          <div className="h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {submitting ? 'Creating job...' : 'Post Job opportunity'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
