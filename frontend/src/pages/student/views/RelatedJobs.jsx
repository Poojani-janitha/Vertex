import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const RelatedJobs = ({ user, profile, applications, onApplicationSubmitted }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Parse student skills from string (e.g. "React, Node, CSS")
  const studentSkills = profile?.skills
    ? profile.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('Fetch open jobs error:', err);
      setError('Failed to fetch platform job postings.');
    } finally {
      setLoading(false);
    }
  };

  // Matcher checking if job has ANY overlapping skills with student's profile
  const isSkillsRelated = (jobSkillsString) => {
    if (!jobSkillsString) return false;
    const jobSkills = jobSkillsString.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return jobSkills.some(skill => studentSkills.includes(skill));
  };

  // Exclude jobs student has already applied to
  const appliedJobIds = applications.map(app => app.jobId);
  const matchedJobs = jobs.filter(job => 
    job.status === 'open' &&
    isSkillsRelated(job.skillsNeeded) &&
    !appliedJobIds.includes(job.id)
  );

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    setFeedback(null);
    try {
      const response = await api.post('/applications', {
        studentId: user.id,
        jobId: jobId,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });

      setFeedback({ type: 'success', text: 'Application submitted successfully!' });
      
      // Notify parent to refetch applications list (which will also automatically exclude this job from matched list)
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Failed to submit application. Please try again.' });
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Related Jobs</h2>
        <p className="text-gray-400 text-sm">
          Recommended jobs based on your profile skills:{' '}
          {studentSkills.length > 0 ? (
            <span className="text-blue-450 font-semibold">{profile.skills}</span>
          ) : (
            <span className="text-yellow-450 italic">None set yet (update your Profile Settings)</span>
          )}
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg text-sm border text-center ${
          feedback.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-red-900/30 text-red-300 border-red-800'
        }`}>
          {feedback.text}
        </div>
      )}

      {studentSkills.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
          <div className="text-gray-600 text-5xl mb-4">💡</div>
          <h3 className="text-lg font-medium text-gray-300">Set your skills first</h3>
          <p className="text-gray-550 text-xs mt-2">
            Add tags to your profile settings to get matching job recommendations.
          </p>
        </div>
      ) : matchedJobs.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
          <div className="text-gray-600 text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-300">No matching jobs</h3>
          <p className="text-gray-550 text-xs mt-2">
            No open jobs matched your specific skills today. Check back later or update your skills!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matchedJobs.map(job => (
            <div key={job.id} className="bg-[#111726] border border-gray-800 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-blue-900/50 transition-colors">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-white text-base">{job.title}</h3>
                  <span className="text-green-400 font-bold text-xs bg-green-950/40 border border-green-900 px-2 py-0.5 rounded">
                    Rs {job.payAmount || 'N/A'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {job.description || 'No description provided.'}
                </p>

                <div className="text-[10px] text-gray-500">📍 {job.locationName || 'Remote / General'}</div>
              </div>

              <div className="space-y-4 pt-3 border-t border-gray-850">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillsNeeded.split(',').map((skill, sIdx) => {
                      const trimmed = skill.trim();
                      const isMatching = studentSkills.includes(trimmed.toLowerCase());
                      return (
                        <span 
                          key={sIdx} 
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isMatching 
                              ? 'bg-blue-950/40 text-blue-400 border-blue-900' 
                              : 'bg-gray-900 text-gray-550 border-gray-800'
                          }`}
                        >
                          {trimmed}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleApply(job.id)}
                  disabled={applyingJobId === job.id}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  {applyingJobId === job.id ? 'Applying...' : 'Apply in One-Click'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedJobs;
