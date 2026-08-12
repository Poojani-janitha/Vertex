const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

router.get('/', checkinController.getAll);
router.get('/:id', checkinController.getById);
router.post('/', checkinController.create);
router.put('/:id', checkinController.update);
router.delete('/:id', checkinController.delete);

module.exports = router;
