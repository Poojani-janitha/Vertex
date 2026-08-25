const { Wallet, Transaction, User, Job, sequelize } = require('../models');

// @desc    Get current user's wallet and transaction history
// @route   GET /api/wallet/my-wallet
// @access  Private
exports.getMyWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find or automatically initialize wallet
    let [wallet] = await Wallet.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        balance: 0.00,
        pendingBalance: 0.00,
        currency: 'LKR'
      }
    });

    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title', 'locationName', 'payAmount'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      wallet,
      transactions
    });
  } catch (error) {
    console.error('Get my wallet error:', error);
    return res.status(500).json({ message: 'Server error retrieving wallet details.', error: error.message });
  }
};

// @desc    Top up wallet balance (e.g. for employers depositing escrow / students adding funds)
// @route   POST /api/wallet/top-up
// @access  Private
exports.topUpWallet = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Please provide a valid top-up amount greater than 0.' });
    }

    let [wallet] = await Wallet.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        balance: 0.00,
        pendingBalance: 0.00,
        currency: 'LKR'
      },
      transaction: t
    });

    wallet.balance = parseFloat(wallet.balance) + parsedAmount;
    await wallet.save({ transaction: t });

    const transactionRecord = await Transaction.create({
      walletId: wallet.id,
      userId,
      amount: parsedAmount,
      type: 'deposit',
      status: 'completed',
      description: `Deposit of LKR ${parsedAmount.toFixed(2)} to wallet`,
      createdAt: new Date()
    }, { transaction: t });

    await t.commit();

    return res.json({
      message: `Successfully added LKR ${parsedAmount.toFixed(2)} to your wallet!`,
      wallet,
      transaction: transactionRecord
    });
  } catch (error) {
    await t.rollback();
    console.error('Top up wallet error:', error);
    return res.status(500).json({ message: 'Server error during wallet top up.', error: error.message });
  }
};

// @desc    Request withdrawal to bank account (Students)
// @route   POST /api/wallet/withdraw
// @access  Private (Student)
exports.requestWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { amount, bankName, branch, accountNumber, accountHolderName } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Please provide a valid withdrawal amount.' });
    }

    if (!bankName || !accountNumber || !accountHolderName) {
      await t.rollback();
      return res.status(400).json({ message: 'Please provide complete bank details (Bank name, account number, and holder name).' });
    }

    let [wallet] = await Wallet.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        balance: 0.00,
        pendingBalance: 0.00,
        currency: 'LKR'
      },
      transaction: t
    });

    if (parseFloat(wallet.balance) < parsedAmount) {
      await t.rollback();
      return res.status(400).json({ 
        message: `Insufficient balance. Available: LKR ${parseFloat(wallet.balance).toFixed(2)}, Requested: LKR ${parsedAmount.toFixed(2)}.` 
      });
    }

    // Deduct available balance and move to pending
    wallet.balance = parseFloat(wallet.balance) - parsedAmount;
    wallet.pendingBalance = parseFloat(wallet.pendingBalance) + parsedAmount;
    await wallet.save({ transaction: t });

    const bankDetailsStr = JSON.stringify({
      bankName,
      branch: branch || 'N/A',
      accountNumber,
      accountHolderName
    });

    const transactionRecord = await Transaction.create({
      walletId: wallet.id,
      userId,
      amount: parsedAmount,
      type: 'withdrawal',
      status: 'pending',
      description: `Bank withdrawal request to ${bankName} (${accountNumber})`,
      bankDetails: bankDetailsStr,
      createdAt: new Date()
    }, { transaction: t });

    await t.commit();

    return res.json({
      message: `Withdrawal request for LKR ${parsedAmount.toFixed(2)} submitted for admin processing.`,
      wallet,
      transaction: transactionRecord
    });
  } catch (error) {
    await t.rollback();
    console.error('Request withdrawal error:', error);
    return res.status(500).json({ message: 'Server error submitting withdrawal request.', error: error.message });
  }
};

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/wallet/admin/withdrawals
// @access  Private (Admin)
exports.getAdminWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.findAll({
      where: { type: 'withdrawal' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(withdrawals);
  } catch (error) {
    console.error('Get admin withdrawals error:', error);
    return res.status(500).json({ message: 'Server error retrieving withdrawal requests.', error: error.message });
  }
};

// @desc    Approve or reject a withdrawal request (Admin)
// @route   PATCH /api/wallet/admin/withdrawals/:id
// @access  Private (Admin)
exports.processAdminWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'completed' or 'rejected'

    if (!['completed', 'rejected'].includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Status must be completed or rejected.' });
    }

    const transaction = await Transaction.findByPk(id, { transaction: t });
    if (!transaction || transaction.type !== 'withdrawal') {
      await t.rollback();
      return res.status(404).json({ message: 'Withdrawal request not found.' });
    }

    if (transaction.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({ message: `This withdrawal request has already been ${transaction.status}.` });
    }

    const wallet = await Wallet.findByPk(transaction.walletId, { transaction: t });
    if (!wallet) {
      await t.rollback();
      return res.status(404).json({ message: 'Associated wallet not found.' });
    }

    const amount = parseFloat(transaction.amount);

    if (status === 'completed') {
      // Completed payout: clear from pending balance
      wallet.pendingBalance = Math.max(0, parseFloat(wallet.pendingBalance) - amount);
      transaction.status = 'completed';
    } else if (status === 'rejected') {
      // Rejected payout: return funds to available balance and clear from pending
      wallet.balance = parseFloat(wallet.balance) + amount;
      wallet.pendingBalance = Math.max(0, parseFloat(wallet.pendingBalance) - amount);
      transaction.status = 'rejected';
    }

    await wallet.save({ transaction: t });
    await transaction.save({ transaction: t });

    await t.commit();

    return res.json({
      message: `Withdrawal request successfully ${status}.`,
      transaction,
      wallet
    });
  } catch (error) {
    await t.rollback();
    console.error('Process withdrawal error:', error);
    return res.status(500).json({ message: 'Server error processing withdrawal.', error: error.message });
  }
};
