import React from 'react';

const ProfileSettings = ({ user, verification }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm animate-fade-in max-w-2xl mx-auto font-sans space-y-6">
      <div className="text-center sm:text-left pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#06402B]">Employer Profile & Settings</h3>
          <p className="text-xs text-gray-500 mt-1">Review your verified business credentials and account parameters.</p>
        </div>
        <span className="self-center sm:self-auto text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800">
          {verification?.verificationStatus || 'Approved'}
        </span>
      </div>
      
      <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 space-y-4">
        <h4 className="font-extrabold text-sm text-[#06402B] border-b border-gray-200 pb-3">Registration Information</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">Contact Person</span>
            <span className="font-extrabold text-gray-900 text-sm">{user?.name}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">Registered Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>

          <div>
            <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">Account Category</span>
            <span className="font-bold text-[#06402B] capitalize">{verification?.accountType || 'Individual'}</span>
          </div>

          {verification?.accountType === 'company' ? (
            <>
              <div>
                <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">Company Name</span>
                <span className="font-bold text-gray-900">{verification.companyName}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">Registration Number</span>
                <span className="font-mono font-bold text-gray-900">{verification.companyRegNo}</span>
              </div>
            </>
          ) : (
            <div>
              <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">NIC / Passport Number</span>
              <span className="font-mono font-bold text-gray-900">{verification?.individualIdNo || 'N/A'}</span>
            </div>
          )}

          <div>
            <span className="font-bold text-gray-500 block mb-0.5 uppercase tracking-wider text-[10px]">Verification Status</span>
            <span className="text-emerald-700 font-extrabold uppercase text-xs">
              ✓ {verification?.verificationStatus || 'Approved'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
