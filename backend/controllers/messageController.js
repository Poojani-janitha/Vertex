const { Message, User, Job, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin'
      ? {}
      : {
          [Op.or]: [
            { senderId: req.user.id },
            { receiverId: req.user.id }
          ]
        };

    const items = await Message.findAll({
      where: whereClause,
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ],
      order: [['sentAt', 'ASC']]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Message.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Message not found' });
    
    if (req.user.role !== 'admin' && item.senderId !== req.user.id && item.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this message.' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { jobId, receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ error: 'Please provide receiverId and message content.' });
    }

    const newItem = await Message.create({
      jobId: jobId || null,
      senderId: req.user.id,
      receiverId,
      message,
      sentAt: new Date()
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Message.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedItem = await Message.findByPk(req.params.id);
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Message.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
