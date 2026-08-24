const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/my-profile', protect, profileController.updateMyProfile);
router.post('/resume', protect, profileController.upload.single('resume'), profileController.uploadResume);

router.get('/', profileController.getAll);
router.get('/:id', profileController.getById);
router.post('/', profileController.create);
router.put('/:id', profileController.update);
router.delete('/:id', profileController.delete);

module.exports = router;
