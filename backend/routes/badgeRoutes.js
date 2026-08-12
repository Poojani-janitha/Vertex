const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

router.get('/', badgeController.getAll);
router.get('/:id', badgeController.getById);
router.post('/', badgeController.create);
router.put('/:id', badgeController.update);
router.delete('/:id', badgeController.delete);

module.exports = router;
