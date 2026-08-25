import { useState } from 'react';
import api from '../../../api/axios';

const Wallet = ({ wallet, transactions, onRefresh }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  // Top Up form state
  const [topUpAmount, setTopUpAmount] = useState('');

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const balance = parseFloat(wallet?.balance || 0);
  const pendingBalance = parseFloat(wallet?.pendingBalance || 0);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await api.post('/wallet/withdraw', {
        amount: withdrawAmount,
        bankName,
        branch,
        accountNumber,
        accountHolderName
      });

      setFeedback({ type: 'success', text: response.data.message });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankName('');
      setBranch('');
      setAccountNumber('');
      setAccountHolderName('');
      if (onRefresh) onRefresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit withdrawal request.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await api.post('/wallet/top-up', {
        amount: topUpAmount
      });

      setFeedback({ type: 'success', text: response.data.message });
      setShowTopUpModal(false);
      setTopUpAmount('');
      if (onRefresh) onRefresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to process deposit.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-[#06402B] mb-2">Student Wallet & Earnings</h2>
        <p className="text-gray-500 text-sm">
          Track your hourly shift earnings, view transactions, and request direct bank withdrawals.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Available Balance Card */}
        <div className="bg-gradient-to-br from-[#06402B] to-[#0a5c3f] rounded-3xl p-6 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-200 text-xs font-bold uppercase tracking-wider">Available Balance</span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              LKR {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 bg-white hover:bg-green-50 text-[#06402B] text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-sm cursor-pointer text-center"
            >
              💸 Withdraw
            </button>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="bg-[#042A1D]/60 hover:bg-[#042A1D] text-white border border-white/20 text-xs font-semibold py-2.5 px-3 rounded-xl transition cursor-pointer"
            >
              + Deposit
            </button>
          </div>
        </div>

        {/* Pending Withdrawals Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Processing</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-600">
              LKR {pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
            Funds currently under processing for bank transfer by platform administrators.
          </p>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Transactions</span>
              <span className="text-emerald-700 text-lg">⚡</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-800">
              {transactions?.length || 0}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
            Automatic payouts are logged immediately upon QR check-out scanning.
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-[#06402B]">Transaction Ledger</h3>
            <p className="text-xs text-gray-500">History of all credits, deposits, and withdrawal requests.</p>
          </div>
          <button
            onClick={onRefresh}
            className="text-xs font-semibold text-[#06402B] hover:text-[#0a5c3f] border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 font-bold">Details</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!transactions || transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    No transactions yet. Complete a shift and scan out to receive your first payout!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPositive = tx.type === 'earnings' || tx.type === 'deposit';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            tx.type === 'earnings'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'deposit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tx.type === 'earnings' && '💼 Earnings'}
                          {tx.type === 'deposit' && '💳 Deposit'}
                          {tx.type === 'withdrawal' && '🏦 Withdrawal'}
                        </span>
                      </td>
                      <td className="py-4 max-w-[280px]">
                        <div className="font-semibold text-gray-800 truncate">{tx.description}</div>
                        {tx.job && <div className="text-[10px] text-gray-400">Job: {tx.job.title}</div>}
                      </td>
                      <td className="py-4 font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-700' : 'text-red-600'}>
                          {isPositive ? '+' : '-'} LKR {parseFloat(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : tx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}{' '}
                        <span className="text-[10px]">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-[#06402B]">Withdraw to Bank</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Available for withdrawal: <strong className="text-emerald-700">LKR {balance.toFixed(2)}</strong>
                </p>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#06402B] uppercase mb-1">Withdrawal Amount (LKR)</label>
                <input
                  type="number"
                  min="100"
                  max={balance}
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#06402B] focus:outline-none focus:border-[#06402B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#06402B] uppercase mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Bank of Ceylon / BOC"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#06402B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#06402B] uppercase mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo 03"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#06402B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#06402B] uppercase mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8001234567"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#06402B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#06402B] uppercase mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. A. Perera"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#06402B]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || balance <= 0 || parseFloat(withdrawAmount) > balance}
                  className="flex-1 bg-[#06402B] hover:bg-[#0a5c3f] disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition shadow-md shadow-emerald-950/20"
                >
                  {loading ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP-UP MODAL */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-sm w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-[#06402B]">Add Funds to Wallet</h3>
                <p className="text-xs text-gray-500 mt-1">Instant simulated top-up</p>
              </div>
              <button onClick={() => setShowTopUpModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#06402B] uppercase mb-1">Top-Up Amount (LKR)</label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  required
                  placeholder="e.g. 2000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#06402B] focus:outline-none focus:border-[#06402B]"
                />
              </div>

              <div className="flex gap-2">
                {[1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-emerald-50 hover:border-emerald-300 transition"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !topUpAmount}
                  className="flex-1 bg-[#06402B] hover:bg-[#0a5c3f] disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition shadow-md shadow-emerald-950/20"
                >
                  {loading ? 'Processing...' : 'Deposit Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
