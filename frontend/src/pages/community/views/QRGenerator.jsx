import React, { useState, useEffect } from 'react';

const QRGenerator = ({ job, type, qrCodeData, onClose }) => {
  const [qrCountdown, setQrCountdown] = useState(600); // 10 mins

  useEffect(() => {
    let timer;
    if (qrCodeData && qrCountdown > 0) {
      timer = setInterval(() => {
        setQrCountdown((prev) => prev - 1);
      }, 1000);
    } else if (qrCountdown === 0) {
      onClose();
    }
    return () => clearInterval(timer);
  }, [qrCodeData, qrCountdown]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#121824] border border-gray-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl">
        <div>
          <h3 className="text-lg font-bold text-white">QR {type === 'check-in' ? 'Check-In' : 'Check-Out'}</h3>
          <p className="text-xs text-gray-400 mt-1">{job.title}</p>
        </div>

        <div className="bg-white p-4 rounded-xl inline-block shadow-md">
          <img src={qrCodeData} alt="Verification QR Code" className="w-48 h-48 mx-auto" />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-300">
            Expires in: <span className="text-yellow-400 font-bold">{Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')}</span>
          </div>
          <p className="text-[10px] text-gray-500">Student must scan this code using their phone camera.</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg border border-gray-700 transition text-xs"
        >
          Close Code
        </button>
      </div>
    </div>
  );
};

export default QRGenerator;
