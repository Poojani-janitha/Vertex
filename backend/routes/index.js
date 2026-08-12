const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);

const profileRoutes = require('./profileRoutes');
router.use('/profiles', profileRoutes);

const availabilityRoutes = require('./availabilityRoutes');
router.use('/availabilitys', availabilityRoutes);

const jobRoutes = require('./jobRoutes');
router.use('/jobs', jobRoutes);

const applicationRoutes = require('./applicationRoutes');
router.use('/applications', applicationRoutes);

const checkinRoutes = require('./checkinRoutes');
router.use('/checkins', checkinRoutes);

const reviewRoutes = require('./reviewRoutes');
router.use('/reviews', reviewRoutes);

const reportRoutes = require('./reportRoutes');
router.use('/reports', reportRoutes);

const badgeRoutes = require('./badgeRoutes');
router.use('/badges', badgeRoutes);

const messageRoutes = require('./messageRoutes');
router.use('/messages', messageRoutes);

module.exports = router;
