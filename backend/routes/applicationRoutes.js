const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.get('/', applicationController.getAll);
router.get('/:id', applicationController.getById);
router.post('/', applicationController.create);
router.put('/:id', applicationController.update);
router.delete('/:id', applicationController.delete);

module.exports = router;
