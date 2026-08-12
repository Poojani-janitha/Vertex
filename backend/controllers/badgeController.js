const { Badge } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const items = await Badge.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Badge.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Badge not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = await Badge.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Badge.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedItem = await Badge.findByPk(req.params.id);
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ error: 'Badge not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Badge.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Badge not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
