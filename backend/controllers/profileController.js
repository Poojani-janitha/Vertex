const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Profile } = require('../models');

// Configure Multer storage for PDF Resumes
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-user-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents (.pdf) are allowed for resume uploads.'), false);
  }
};

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a valid PDF resume file.' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    let profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await Profile.create({ userId: req.user.id, resumeUrl });
    } else {
      profile.resumeUrl = resumeUrl;
      await profile.save();
    }

    return res.status(200).json({
      message: 'Resume uploaded and linked to profile successfully!',
      resumeUrl,
      profile
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({ message: 'Server error uploading resume.', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await Profile.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Profile.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = await Profile.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Profile.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedItem = await Profile.findByPk(req.params.id);
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Profile.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const [updated] = await Profile.update(req.body, {
      where: { userId: req.user.id }
    });
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
