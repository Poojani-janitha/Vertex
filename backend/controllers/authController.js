const jwt = require('jsonwebtoken');
const { User, Profile, EmployerVerification } = require('../models');
const sendEmail = require('../utils/sendEmail');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      accountType,
      individualIdNo,
      companyName,
      companyRegNo,
      documentUrl
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Extra validation for employers/companies
    if (role === 'employer') {
      if (!accountType || !['individual', 'company'].includes(accountType)) {
        return res.status(400).json({ message: 'Employer registration requires accountType: individual or company.' });
      }
      if (accountType === 'individual' && !individualIdNo) {
        return res.status(400).json({ message: 'Individual employer registration requires individualIdNo.' });
      }
      if (accountType === 'company' && (!companyName || !companyRegNo)) {
        return res.status(400).json({ message: 'Company employer registration requires companyName and companyRegNo.' });
      }
    }

    // Prevent admin role injection
    if (role === 'admin') {
      return res.status(403).json({ message: 'Registration as an administrator is not permitted.' });
    }

    const safeRole = role === 'employer' ? 'employer' : 'student';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      phone
    });

    // Automatically create profile if the user is a student
    if (user.role === 'student') {
      await Profile.create({ userId: user.id });
    }

    // Automatically create employer verification if the user is an employer
    if (user.role === 'employer') {
      await EmployerVerification.create({
        userId: user.id,
        accountType,
        individualIdNo: accountType === 'individual' ? individualIdNo : null,
        companyName: accountType === 'company' ? companyName : null,
        companyRegNo: accountType === 'company' ? companyRegNo : null,
        documentUrl,
        verificationStatus: 'pending'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Check for user (explicitly need password to check if excluded normally, but since we disabled default excludes, it's loaded)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user.id);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const includeOptions = [];
    if (req.user.role === 'student') {
      includeOptions.push({ model: Profile, as: 'profile' });
    } else if (req.user.role === 'employer') {
      includeOptions.push({ model: EmployerVerification, as: 'employerVerification' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: includeOptions
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile.', error: error.message });
  }
};

// @desc    Forgot Password - Generates reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return 200 even if user doesn't exist for security (prevent email enumeration)
      return res.status(200).json({ message: 'If an account with that email exists, a reset link has been generated.' });
    }

    // Create a one-time link valid for 15 minutes
    // The secret is JWT_SECRET + current password. If password changes, token is invalidated.
    const secret = process.env.JWT_SECRET + user.password;
    const payload = {
      email: user.email,
      id: user.id
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    
    const resetLink = `http://localhost:5173/reset-password/${user.id}/${token}`;
    
    const htmlMessage = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click on the link below to set a new password:</p>
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
      <p>This link is valid for 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send email using nodemailer
    const previewUrl = await sendEmail({
      email: user.email,
      subject: 'Vertex - Password Reset Request',
      message: `You requested a password reset. Please click on the link below to set a new password:\n\n${resetLink}\n\nThis link is valid for 15 minutes.`,
      htmlMessage
    });

    return res.status(200).json({ 
      message: 'If an account with that email exists, a reset email has been sent.',
      resetLink: previewUrl || resetLink // Return preview URL if using Ethereal, else the raw link for dev
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error processing request.' });
  }
};

// @desc    Reset Password - Verifies token and updates password
// @route   POST /api/auth/reset-password/:id/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const secret = process.env.JWT_SECRET + user.password;
    try {
      const payload = jwt.verify(token, secret);
      // Valid token!
      user.password = newPassword;
      await user.save();
      
      return res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (err) {
      console.log("Token verification failed: ", err.message);
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error resetting password.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
};