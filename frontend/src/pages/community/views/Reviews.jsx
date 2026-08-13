import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const Reviews = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('received'); // 'received' | 'sent'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [activeSubTab]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = activeSubTab === 'received' 
        ? `/reviews?toUser=${user.id}` 
        : `/reviews?fromUser=${user.id}`;
      const response = await api.get(url);
      setReviews(response.data);
    } catch (err) {
      console.error('Fetch employer reviews error:', err);
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-sm">
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Reviews Feed</h2>
        <p className="text-gray-400 text-sm">
          Monitor reviews submitted by students regarding your job listings and view your submitted feedback.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-4">
        <button
          onClick={() => setActiveSubTab('received')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            activeSubTab === 'received'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#111726] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
          }`}
        >
          Received Reviews (from Students)
        </button>
        <button
          onClick={() => setActiveSubTab('sent')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            activeSubTab === 'sent'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#111726] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
          }`}
        >
          Sent Reviews
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-[#111726] border border-gray-800 border-dashed rounded-xl">
          <div className="text-gray-600 text-5xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-300">No reviews found</h3>
          <p className="text-gray-550 text-xs mt-2">
            {activeSubTab === 'received' 
              ? "No students have submitted reviews for your jobs yet." 
              : "You haven't submitted any reviews for students yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => {
            const partner = activeSubTab === 'received' ? review.sender : review.receiver;
            return (
              <div 
                key={review.id} 
                className="bg-[#111726] border border-gray-800 rounded-xl p-5 space-y-4 hover:border-blue-900/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {review.job?.title || 'Unknown Job'}
                    </h3>
                    
                    {/* Review Partner / Student details */}
                    <div className="text-[10px] text-gray-500 mt-2 bg-[#0b0e17]/60 p-2 rounded border border-gray-850 space-y-1">
                      <div className="uppercase tracking-wider text-[8px] font-bold text-gray-600">
                        {activeSubTab === 'received' ? 'Reviewer Student Details' : 'Recipient Details'}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-300 font-semibold text-[11px]">{partner?.name || 'Unknown User'}</span>
                        <span className="text-gray-400 font-mono text-[9px]">{partner?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {renderStars(review.rating)}
                    <span className="text-[9px] text-gray-600">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed bg-[#0b0e17]/50 p-3 rounded-lg border border-gray-800">
                  {review.comment || 'No written feedback provided.'}
                </p>

                {review.job && (
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800/60">
                    <span>📍 {review.job.locationName || 'Remote / General'}</span>
                    <span className="text-green-400 font-bold">Rs {review.job.payAmount || 'N/A'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
