import React, { useState } from 'react';
import api from '../../../api/axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

const PostJob = ({ onJobCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [position, setPosition] = useState([6.9271, 79.8612]); // Colombo center
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        <p className="text-xs text-gray-400">Fill in details and pin location coordinates on the free Leaflet map.</p>
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
            <label className="block text-xs font-semibold text-gray-300 mb-1">Location Name</label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date & Time</label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">End Date & Time</label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Leaflet map selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Pin Location Coordinates on Map</label>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationSelector position={position} setPosition={setPosition} />
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
