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
      console.error('Fetch reviews error:', err);
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#06402B] mb-2">My Reviews</h2>
        <p className="text-gray-500 text-sm">
          Track the reviews you have received from employers and the feedback you have submitted.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveSubTab('received')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            activeSubTab === 'received'
              ? 'bg-[#06402B] border-[#06402B] text-[#06402B] shadow-md shadow-blue-500/20'
              : 'bg-white border-gray-200 text-gray-500 hover:text-[#06402B] hover:border-gray-200'
          }`}
        >
          Received Reviews
        </button>
        <button
          onClick={() => setActiveSubTab('sent')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            activeSubTab === 'sent'
              ? 'bg-[#06402B] border-[#06402B] text-[#06402B] shadow-md shadow-blue-500/20'
              : 'bg-white border-gray-200 text-gray-500 hover:text-[#06402B] hover:border-gray-200'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06402B]"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 border-dashed rounded-xl">
          <div className="text-gray-600 text-5xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-600">No reviews found</h3>
          <p className="text-gray-550 text-xs mt-2">
            {activeSubTab === 'received' 
              ? "You haven't received any reviews from employers yet." 
              : "You haven't submitted any reviews for employers yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => {
            const partner = activeSubTab === 'received' ? review.sender : review.receiver;
            return (
              <div 
                key={review.id} 
                className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 hover:border-blue-900/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#06402B] text-sm">
                      {review.job?.title || 'Unknown Job'}
                    </h3>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {activeSubTab === 'received' ? 'From' : 'To'}:{' '}
                      <span className="text-blue-600 font-semibold">{partner?.name || 'Unknown User'}</span>{' '}
                      ({partner?.email || 'N/A'})
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderStars(review.rating)}
                    <span className="text-[9px] text-gray-600">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-200">
                  {review.comment || 'No written feedback provided.'}
                </p>

                {review.job && (
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-200/60">
                    <span>📍 {review.job.locationName || 'Remote / General'}</span>
                    <span className="text-green-400 font-bold">LKR {review.job.payAmount || 'N/A'}</span>
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
