import React, { useState } from 'react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    
    // Simulate API form submission
    setTimeout(() => {
      setLoading(false);
      setFeedback('Thank you for contacting us! Your inquiry has been sent to our administration team.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-[#06402B] tracking-tight sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 text-base text-gray-500">
          Have questions about the platform, account verifications, or job matching? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white/40 p-8 sm:p-12 rounded-3xl border border-gray-200/80 shadow-2xl">
        
        {/* Left Column: Direct Info Card */}
        <div className="lg:col-span-2 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#06402B]">Contact Information</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              If you are a business awaiting employer account verification, please allow up to 24 hours. Alternatively, feel free to speed up the process by reaching out via email or phone.
            </p>
          </div>

          <div className="space-y-4 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span className="text-lg bg-gray-100 p-2.5 rounded-lg border border-gray-200">📍</span>
              <div>
                <div className="font-semibold text-[#06402B]">WorkOra Headquarters</div>
                <div className="text-[10px] text-gray-500">123 Colombo Rd, Colombo, Sri Lanka</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-lg bg-gray-100 p-2.5 rounded-lg border border-gray-200">✉️</span>
              <div>
                <div className="font-semibold text-[#06402B]">Support Helpdesk</div>
                <div className="text-[10px] text-gray-500">support@workora.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-lg bg-gray-100 p-2.5 rounded-lg border border-gray-200">📞</span>
              <div>
                <div className="font-semibold text-[#06402B]">Call Office Support</div>
                <div className="text-[10px] text-gray-500">+94 11 234 5678</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex gap-4 text-xs text-gray-500">
            <span className="hover:text-[#06402B] transition cursor-pointer">Facebook</span>
            <span className="hover:text-[#06402B] transition cursor-pointer">Twitter</span>
            <span className="hover:text-[#06402B] transition cursor-pointer">LinkedIn</span>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold text-[#06402B]">Send a Message</h2>
          
          {feedback && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs text-center">
              {feedback}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-[#06402B] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-[#06402B] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Subject</label>
            <input 
              type="text" 
              required 
              placeholder="Inquiry / Verification / General Question"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-[#06402B] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-colors" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Message Description</label>
            <textarea 
              rows="5"
              required 
              placeholder="Describe your inquiry details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-[#06402B] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 transition-colors" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-3 px-6 rounded-xl transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting Form...' : 'Send Message Enquiry'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Contact;
