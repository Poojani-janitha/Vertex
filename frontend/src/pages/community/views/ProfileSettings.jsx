import React from 'react';

const ProfileSettings = ({ user, verification }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 shadow-lg animate-fade-in">
      <h3 className="text-lg font-bold text-[#06402B] mb-2">Employer Settings</h3>
      <p className="text-xs mb-6">Manage company verification credentials, individual ID submissions, and email notification parameters.</p>
      
      <div className="bg-gray-100/50 p-6 rounded-xl border border-gray-200 max-w-md mx-auto text-left space-y-2">
        <h4 className="font-bold text-gray-600 border-b border-gray-200 pb-2 mb-2">Profile Overview</h4>
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Name:</span> {user.name}</div>
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Email:</span> {user.email}</div>
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Account Type:</span> {verification?.accountType}</div>
        {verification?.accountType === 'company' ? (
          <>
            <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Company Name:</span> {verification.companyName}</div>
            <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Registration No:</span> {verification.companyRegNo}</div>
          </>
        ) : (
          <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">NIC/Passport No:</span> {verification?.individualIdNo}</div>
        )}
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Status:</span> <span className="text-green-400 font-bold uppercase">{verification?.verificationStatus}</span></div>
      </div>
    </div>
  );
};

export default ProfileSettings;
