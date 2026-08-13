const { Emergency, User } = require('../models');

// @desc    Trigger an emergency alert
// @route   POST /api/emergencies
// @access  Private (Student)
exports.createEmergency = async (req, res) => {
  try {
    const studentId = req.user.id; // User must be authenticated

    const emergency = await Emergency.create({
      studentId,
      status: 'active'
    });

    return res.status(201).json({ 
      message: 'Emergency alert triggered successfully!', 
      emergency 
    });
  } catch (error) {
    console.error('Create emergency error:', error);
    return res.status(500).json({ 
      message: 'Server error triggering emergency.', 
      error: error.message 
    });
  }
};
