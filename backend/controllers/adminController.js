const { User, Job, Review, Report, EmployerVerification } = require('../models');

// @desc    Get all pending employer verifications
// @route   GET /api/admin/employers/pending
// @access  Private (Admin)
exports.getPendingEmployers = async (req, res) => {
  try {
    const pending = await EmployerVerification.findAll({
      where: { verificationStatus: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    return res.json(pending);
  } catch (error) {
    console.error('Get pending employers error:', error);
    return res.status(500).json({ message: 'Server error retrieving pending employers.', error: error.message });
  }
};

// @desc    Verify an employer (approve or reject)
// @route   PATCH /api/admin/employers/:userId/verify
// @access  Private (Admin)
exports.verifyEmployer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide status: approved or rejected.' });
    }

    const verification = await EmployerVerification.findOne({ where: { userId } });
    if (!verification) {
      return res.status(404).json({ message: 'Verification record not found for this user.' });
    }

    // Update verification details
    verification.verificationStatus = status;
    verification.verifiedBy = req.user.id;
    verification.verifiedAt = new Date();
    await verification.save();

    // Toggle User isVerified status
    const user = await User.findByPk(userId);
    if (user) {
      user.isVerified = (status === 'approved');
      await user.save();
    }

    return res.json({
      message: `Employer successfully ${status}.`,
      verification
    });
  } catch (error) {
    console.error('Verify employer error:', error);
    return res.status(500).json({ message: 'Server error during employer verification.', error: error.message });
  }
};

// @desc    Delete a review (e.g. fake or bad)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    return res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ message: 'Server error deleting review.', error: error.message });
  }
};

// @desc    Delete a job post (breaking rules)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    return res.json({ message: 'Job deleted successfully.' });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({ message: 'Server error deleting job.', error: error.message });
  }
};

// @desc    Get all reports sent by students
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json(reports);
  } catch (error) {
    console.error('Get all reports error:', error);
    return res.status(500).json({ message: 'Server error retrieving reports.', error: error.message });
  }
};

// @desc    Update report status (reviewed/resolved)
// @route   PATCH /api/admin/reports/:id
// @access  Private (Admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'open', 'reviewed', 'resolved'
    if (!status || !['open', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Please provide status: open, reviewed, or resolved.' });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    await report.save();

    return res.json({
      message: 'Report status updated successfully.',
      report
    });
  } catch (error) {
    console.error('Update report error:', error);
    return res.status(500).json({ message: 'Server error updating report status.', error: error.message });
  }
};
