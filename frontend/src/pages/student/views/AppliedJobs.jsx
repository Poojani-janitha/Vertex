import React, { useState } from 'react';
import api from '../../../api/axios';

const AppliedJobs = ({ applications, reviewedJobIds = [], user, onReviewSubmitted }) => {
  const [filter, setFilter] = useState('all');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Job Details Modal State
  const [selectedDetailsJob, setSelectedDetailsJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsTrustScore, setDetailsTrustScore] = useState(null);

  // Student Attendance QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQrToken] = useState(null);
  const [qrJobTitle, setQrJobTitle] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getFilterBtnClass = (statusType) => {
    return `px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
      filter === statusType
        ? 'bg-[#06402B] border-[#06402B] text-[#06402B] shadow-md shadow-blue-500/20'
        : 'bg-white border-gray-200 text-gray-500 hover:text-[#06402B] hover:border-gray-200'
    }`;
  };

  const handleOpenReview = (job) => {
    setSelectedJob(job);
    setRating(5);
    setComment('');
    setFeedback(null);
    setShowReviewModal(true);
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setSelectedJob(null);
    setFeedback(null);
  };

  const handleOpenDetails = async (job) => {
    if (!job) return;
    // Reset previous states to prevent showing old modal details while loading
    setSelectedDetailsJob(null);
    setDetailsTrustScore(null);
    setDetailsLoading(true);
    setShowDetailsModal(true);
    try {
      const [jobRes, scoreRes] = await Promise.all([
        api.get(`/jobs/${job.id}`),
        api.get(`/users/${job.employerId}/trust-score`)
      ]);
      setSelectedDetailsJob(jobRes.data);
      setDetailsTrustScore(scoreRes.data);
    } catch (err) {
      console.error('Failed to fetch job details/trust score:', err);
      // Fallback to simple job properties passed in if backend fails
      setSelectedDetailsJob(job);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post('/reviews', {
        jobId: selectedJob.id,
        fromUser: user.id,
        toUser: selectedJob.employerId,
        rating,
        comment
      });
      setFeedback({ type: 'success', text: 'Review submitted successfully!' });
      
      // Sync dashboard data
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Close modal shortly
      setTimeout(() => {
        handleCloseReview();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareShift = (app) => {
    const job = app.job;
    if (!job) return;

    const message = `🚨 *WorkOra SOS & Shift Share* 🚨\n\nI am starting my shift with the following details:\n` +
      `• *Job:* ${job.title}\n` +
      `• *Company/Recruiter ID:* ${job.employerId}\n` +
      `• *Location:* ${job.locationName || 'Unspecified'}\n` +
      `• *Pay:* LKR ${job.payAmount || 'N/A'}/hr\n` +
      `• *Shift Time:* ${new Date(job.startTime).toLocaleString()} - ${new Date(job.endTime).toLocaleString()}\n` +
      `• *Student:* ${user?.name || 'Student'}\n\n` +
      `Please monitor my safety!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewQR = async (app) => {
    if (!app) return;
    setQrToken(null);
    setQrError(null);
    setQrJobTitle(app.job?.title || 'Shift Attendance');
    setQrLoading(true);
    setShowQRModal(true);
    try {
      const response = await api.get(`/jobs/applications/${app.id}/qr`);
      setQrToken(response.data.qrToken);
    } catch (err) {
      setQrError(err.response?.data?.message || 'Failed to load attendance QR token.');
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#06402B] mb-2">My Jobs</h2>
          <p className="text-gray-500 text-sm">Track your submitted job applications and verify recruiter decisions.</p>
        </div>
        
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={getFilterBtnClass('all')}>
            All ({applications.length})
          </button>
          <button onClick={() => setFilter('pending')} className={getFilterBtnClass('pending')}>
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button onClick={() => setFilter('accepted')} className={getFilterBtnClass('accepted')}>
            Approved ({applications.filter(a => a.status === 'accepted').length})
          </button>
          <button onClick={() => setFilter('rejected')} className={getFilterBtnClass('rejected')}>
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-20 bg-gray-100/30 rounded-2xl border border-gray-200 border-dashed">
          <div className="text-gray-600 text-5xl mb-4">💼</div>
          <h3 className="text-lg font-medium text-gray-600">No applications found</h3>
          <p className="text-gray-550 text-xs mt-2">
            {filter === 'all' 
              ? 'Browse the Jobs Board to apply for student listings.' 
              : `You do not have any applications marked as ${filter}.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-450 uppercase bg-gray-100/40 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Pay Amount</th>
                <th className="px-6 py-4">Date Applied</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.map((app) => {
                const hasEnded = app.job?.endTime ? new Date(app.job.endTime) < new Date() : false;
                const isApproved = app.status === 'accepted';
                const alreadyReviewed = reviewedJobIds.includes(app.jobId);

                return (
                  <tr key={app.id} className="hover:bg-gray-100/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#06402B]">
                      <button 
                        type="button"
                        onClick={() => handleOpenDetails(app.job)} 
                        className="font-semibold text-[#06402B] hover:text-blue-600 hover:underline text-left focus:outline-none"
                      >
                        {app.job?.title || 'Unknown Job'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-green-400 font-semibold">LKR {app.job?.payAmount || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        app.status === 'accepted' ? 'bg-green-950/40 text-green-400 border-green-800' :
                        app.status === 'rejected' ? 'bg-red-950/40 text-red-400 border-red-800' :
                        'bg-yellow-950/40 text-yellow-450 border-yellow-800'
                      }`}>
                        {app.status === 'accepted' ? 'approved' : (app.status || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isApproved && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleShareShift(app)}
                              className="bg-green-600 hover:bg-green-500 text-[10px] font-bold text-[#06402B] px-2.5 py-1 rounded-lg uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                            >
                              🟢 Share Shift (SOS)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleViewQR(app)}
                              className="bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-[#06402B] px-2.5 py-1 rounded-lg uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                            >
                              📷 Attendance QR
                            </button>
                          </>
                        )}
                        {isApproved && hasEnded ? (
                          alreadyReviewed ? (
                            <span className="text-[10px] text-gray-500 font-bold bg-gray-100 border border-gray-200 px-2 py-1 rounded uppercase tracking-wider">Reviewed</span>
                          ) : (
                            <button 
                              onClick={() => handleOpenReview(app.job)}
                              className="bg-[#06402B] hover:bg-[#0a5c3f] text-[10px] font-bold text-[#06402B] px-3 py-1 rounded-lg uppercase tracking-wider transition shadow shadow-blue-500/20"
                            >
                              Review
                            </button>
                          )
                        ) : (
                          !isApproved && <span className="text-gray-600 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && selectedJob && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white/80">
              <h3 className="text-base font-bold text-[#06402B]">
                ⭐️ Review Employer / Job
              </h3>
              <button 
                onClick={handleCloseReview}
                className="text-gray-500 hover:text-[#06402B]"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {feedback && (
                <div className={`p-3 rounded-lg text-xs text-center border ${
                  feedback.type === 'success' 
                    ? 'bg-green-950/40 border-green-800 text-green-300' 
                    : 'bg-red-950/40 border-red-800 text-red-300'
                }`}>
                  {feedback.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reviewing Job</label>
                <div className="text-sm font-semibold text-[#06402B]">{selectedJob.title}</div>
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform transform active:scale-95 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Feedback Description</label>
                <textarea 
                  required 
                  rows="4" 
                  placeholder="Share your experience working on this gig..." 
                  className="w-full bg-gray-100 border border-gray-750 text-[#06402B] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#06402B]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseReview}
                  className="bg-gray-850 hover:bg-gray-100 text-[#06402B] text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 space-y-6">
              
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-[#06402B] font-sans">
                  {detailsLoading ? 'Loading details...' : selectedDetailsJob?.title}
                </h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-[#06402B] transition-colors"
                >
                  ✕
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06402B]"></div>
                </div>
              ) : selectedDetailsJob ? (
                <div className="space-y-6 text-sm text-gray-600">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-100/30 p-4 rounded-xl border border-gray-200">
                      {selectedDetailsJob.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100/50 p-4 rounded-lg border border-gray-200/50">
                      <div className="text-gray-500 text-xs mb-1">Pay Amount</div>
                      <div className="text-lg font-semibold text-green-400">LKR {selectedDetailsJob.payAmount || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-100/50 p-4 rounded-lg border border-gray-200/50">
                      <div className="text-gray-500 text-xs mb-1">Location</div>
                      <div className="text-md font-medium text-[#06402B]">{selectedDetailsJob.locationName || 'Remote / Unspecified'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-450 bg-gray-100/30 p-4 rounded-xl border border-gray-200">
                    <div>📅 Start Time: <span className="text-[#06402B] font-medium">{selectedDetailsJob.startTime ? new Date(selectedDetailsJob.startTime).toLocaleString() : 'N/A'}</span></div>
                    <div>📅 End Time: <span className="text-[#06402B] font-medium">{selectedDetailsJob.endTime ? new Date(selectedDetailsJob.endTime).toLocaleString() : 'N/A'}</span></div>
                  </div>

                  {detailsTrustScore && (
                    <div className="bg-[#1c2234] p-5 rounded-xl border border-gray-750 space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employer Trust Score</h4>
                        <span className="text-sm font-extrabold text-green-400">{detailsTrustScore.score}/100</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600">
                        <div className="flex justify-between p-2 rounded bg-gray-100/45">
                          <span>⭐ Average Rating:</span>
                          <strong className="text-[#06402B]">{detailsTrustScore.metrics?.avgRating}★ ({detailsTrustScore.breakdown?.rating}/40 pts)</strong>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-gray-100/45">
                          <span>⏱️ Worked Hours:</span>
                          <strong className="text-[#06402B]">{detailsTrustScore.metrics?.verifiedHours}h ({detailsTrustScore.breakdown?.hours}/30 pts)</strong>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-gray-100/45">
                          <span>💬 Reply Rate:</span>
                          <strong className="text-[#06402B]">{detailsTrustScore.metrics?.replyRate || 0}% ({detailsTrustScore.breakdown?.reply}/20 pts)</strong>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-gray-100/45">
                          <span>💼 Completed Jobs:</span>
                          <strong className="text-[#06402B]">{detailsTrustScore.metrics?.completedJobs} ({detailsTrustScore.breakdown?.completed}/10 pts)</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDetailsJob.skillsNeeded && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDetailsJob.skillsNeeded.split(',').map((skill, index) => (
                          <span key={index} className="bg-blue-950/40 text-blue-600 border border-blue-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                {selectedDetailsJob && applications.find(a => a.jobId === selectedDetailsJob.id)?.status === 'accepted' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleShareShift(applications.find(a => a.jobId === selectedDetailsJob.id))}
                      className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                    >
                      🟢 Share Shift (SOS)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewQR(applications.find(a => a.jobId === selectedDetailsJob.id))}
                      className="bg-purple-600 hover:bg-purple-500 text-[#06402B] font-semibold py-2 px-6 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                    >
                      📷 Attendance QR
                    </button>
                  </>
                )}
                <button 
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-[#06402B] font-semibold py-2 px-6 rounded-lg transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Attendance QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white/80">
              <h3 className="text-base font-bold text-[#06402B]">
                📷 Shift Attendance QR
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setShowQRModal(false);
                  setQrToken(null);
                  setQrError(null);
                }}
                className="text-gray-500 hover:text-[#06402B] cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 text-center space-y-4 bg-[#0e131f]/20">
              <div className="text-xs text-blue-600 font-semibold">{qrJobTitle}</div>
              
              {qrLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06402B]"></div>
                </div>
              ) : qrError ? (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-lg">
                  {qrError}
                </div>
              ) : qrToken ? (
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-xl inline-block shadow-lg mx-auto">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrToken)}`} 
                      alt="Attendance Token Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Present this QR code to your employer at the shift location to record your check-in and check-out times.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No token code available.</p>
              )}
              
              <button 
                type="button"
                onClick={() => {
                  setShowQRModal(false);
                  setQrToken(null);
                  setQrError(null);
                }}
                className="w-full bg-gray-850 hover:bg-gray-100 text-[#06402B] font-semibold py-2 px-4 rounded-lg transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppliedJobs;
