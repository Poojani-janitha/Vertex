import React from 'react';

const ProfileSettings = ({ user, verification }) => {
  return (
    <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 text-center text-gray-400 shadow-lg animate-fade-in">
      <h3 className="text-lg font-bold text-white mb-2">Employer Settings</h3>
      <p className="text-xs mb-6">Manage company verification credentials, individual ID submissions, and email notification parameters.</p>
      
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 max-w-md mx-auto text-left space-y-2">
        <h4 className="font-bold text-gray-300 border-b border-gray-800 pb-2 mb-2">Profile Overview</h4>
        <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">Name:</span> {user.name}</div>
        <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">Email:</span> {user.email}</div>
        <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">Account Type:</span> {verification?.accountType}</div>
        {verification?.accountType === 'company' ? (
          <>
            <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">Company Name:</span> {verification.companyName}</div>
            <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">Registration No:</span> {verification.companyRegNo}</div>
          </>
        ) : (
          <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">NIC/Passport No:</span> {verification?.individualIdNo}</div>
        )}
        <div className="text-xs text-gray-400"><span className="font-semibold text-gray-300">Status:</span> <span className="text-green-400 font-bold uppercase">{verification?.verificationStatus}</span></div>
      </div>
    </div>
  );
};

export default ProfileSettings;
