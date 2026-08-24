const express = require('express');
const {
  getMyWallet,
  topUpWallet,
  requestWithdrawal,
  getAdminWithdrawals,
  processAdminWithdrawal
} = require('../controllers/walletController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Authenticated user wallet routes
router.get('/my-wallet', protect, getMyWallet);
router.post('/top-up', protect, topUpWallet);
router.post('/withdraw', protect, requestWithdrawal);

// Admin-only withdrawal management routes
router.get('/admin/withdrawals', protect, restrictTo('admin'), getAdminWithdrawals);
router.patch('/admin/withdrawals/:id', protect, restrictTo('admin'), processAdminWithdrawal);

module.exports = router;
