import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../../api/axios';

const ScanQR = ({ onClose }) => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const qrCodeInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    // Create the html5-qrcode instance using the DOM container ID
    const html5QrCode = new Html5Qrcode('reader');
    qrCodeInstanceRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        // Start scanner with back camera (fallback to front camera automatically)
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            if (isMounted) {
              handleVerifyQR(decodedText);
            }
          },
          (errorMessage) => {
            // Silent log checkins
          }
        );
      } catch (err) {
        console.warn('Failed to start camera scanner:', err);
      }
    };

    // Tiny timeout to ensure the DOM element #reader is fully rendered before mounting
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      // Stop scanning and release the camera stream cleanly before unmount
      if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
        qrCodeInstanceRef.current
          .stop()
          .then(() => {
            console.log('Camera scanner stopped cleanly.');
          })
          .catch((err) => {
            console.warn('Failed to stop camera stream during unmount:', err);
          });
      }
    };
  }, []);

  const handleVerifyQR = async (token) => {
    if (!token) return;
    setLoading(true);
    setFeedback(null);

    try {
      const response = await api.post('/jobs/checkin/scan', { qrToken: token });
      setFeedback({
        type: 'success',
        message: response.data.message,
        details: response.data.checkin
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to verify QR code token.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleVerifyQR(manualToken.trim());
    setManualToken('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-lg animate-fade-in max-w-3xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-[#06402B]">Scan Student Attendance QR</h3>
          <p className="text-xs text-gray-500">Scan the unique check-in/check-out QR code shown by the student to record their shift attendance.</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs bg-gray-100 hover:bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg border border-gray-200 transition cursor-pointer"
          >
            ✕ Close
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-5 rounded-2xl border text-xs space-y-2 ${
          feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="font-bold text-sm">{feedback.message}</div>
          {feedback.details && (
            <div className="mt-2 space-y-1.5 bg-white p-4 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-700 shadow-sm">
              {feedback.details.student && (
                <>
                  <div className="font-bold text-[#06402B] mb-1">🎓 Student Details:</div>
                  <div className="pl-2">Name: <strong className="text-gray-900">{feedback.details.student.name}</strong></div>
                  <div className="pl-2 pb-2 text-[10px] text-gray-500">Email: {feedback.details.student.email}</div>
                </>
              )}
              {feedback.details.job && (
                <div className="pl-2 pb-2 text-emerald-800 font-semibold">Shift: {feedback.details.job.title}</div>
              )}
              <div className="font-bold text-[#06402B] mb-1 border-t border-gray-100 pt-2 mt-2">⏱ Attendance Log:</div>
              {feedback.details.checkInTime && (
                <div className="pl-2 text-gray-700">Checked In At: {new Date(feedback.details.checkInTime).toLocaleString()}</div>
              )}
              {feedback.details.checkOutTime && (
                <div className="pl-2 text-emerald-700 font-bold">Checked Out At: {new Date(feedback.details.checkOutTime).toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WEBCAM READER CONTAINER */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Webcam Scanner View</label>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden p-4 relative z-0 flex justify-center">
          <div id="reader" className="w-full max-w-md bg-[#0e131f] rounded-xl min-h-[250px]"></div>
        </div>
      </div>

      {/* MANUAL OVERRIDE FALLBACK */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Manual Code Override (Demo / Testing)</label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Paste check-in token text (JWT)..."
            className="flex-grow bg-gray-50 border border-gray-200 text-[#06402B] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#06402B]"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !manualToken.trim()}
            className="bg-[#06402B] hover:bg-[#0a5c3f] disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify Token'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScanQR;
