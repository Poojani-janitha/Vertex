const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/', jobController.getAll);
router.get('/:id', jobController.getById);
router.post('/', jobController.create);
router.put('/:id', jobController.update);
router.delete('/:id', jobController.delete);

module.exports = router;
