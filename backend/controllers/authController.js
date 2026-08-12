const jwt = require('jsonwebtoken');
const { User, Profile, EmployerVerification } = require('../models');

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

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
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

module.exports = {
  register,
  login,
  getProfile
};