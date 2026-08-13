const { User, Review, Checkin, Job, Message } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const items = await User.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await User.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = await User.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedItem = await User.findByPk(req.params.id);
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrustScore = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Average Rating (40%)
    const reviews = await Review.findAll({ where: { toUser: id } });
    let avgRating = 5.0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      avgRating = sum / reviews.length;
    }
    const ratingScore = (avgRating / 5.0) * 40;

    // 2. Verified Hours from QR check-ins (30%)
    const employerJobs = await Job.findAll({ where: { employerId: id } });
    const jobIds = employerJobs.map(j => j.id);
    
    let verifiedHours = 0;
    if (jobIds.length > 0) {
      const checkins = await Checkin.findAll({ where: { jobId: jobIds } });
      checkins.forEach(c => {
        if (c.checkInTime && c.checkOutTime) {
          const diffMs = new Date(c.checkOutTime) - new Date(c.checkInTime);
          const hours = diffMs / (1000 * 60 * 60);
          if (hours > 0) verifiedHours += hours;
        }
      });
    }
    // Capped at 30 hours for maximum 30 points
    const hoursScore = Math.min((verifiedHours / 30) * 30, 30);

    // 3. Reply Rate (20%) - Calculate based on messages: replies sent vs inquiries received
    const sentCount = await Message.count({ where: { senderId: id } });
    const receivedCount = await Message.count({ where: { receiverId: id } });
    const replyRate = receivedCount === 0 ? 1.0 : Math.min(sentCount / receivedCount, 1.0);
    const replyScore = replyRate * 20;

    // 4. Completed Jobs (10%)
    const completedJobs = employerJobs.filter(j => j.status === 'closed' || j.status === 'filled').length;
    const completedJobsScore = Math.min((completedJobs / 3) * 10, 10);

    const totalScore = Math.round(ratingScore + hoursScore + replyScore + completedJobsScore);

    return res.status(200).json({
      score: totalScore,
      breakdown: {
        rating: Math.round(ratingScore),
        hours: Math.round(hoursScore),
        reply: Math.round(replyScore),
        completed: Math.round(completedJobsScore)
      },
      metrics: {
        avgRating: avgRating.toFixed(1),
        verifiedHours: verifiedHours.toFixed(1),
        replyRate: Math.round(replyRate * 100),
        completedJobs
      }
    });
  } catch (error) {
    console.error('Trust Score Calculation Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
