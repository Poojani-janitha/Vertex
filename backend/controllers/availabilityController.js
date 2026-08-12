const { Availability, Profile } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const items = await Availability.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Availability.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Availability not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = await Availability.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Availability.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedItem = await Availability.findByPk(req.params.id);
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ error: 'Availability not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Availability.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Availability not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyAvailability = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    const items = await Availability.findAll({ where: { profileId: profile.id } });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMyAvailability = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const availabilityData = req.body; // Array of { dayOfWeek, startTime, endTime, isAvailable }

    if (!Array.isArray(availabilityData)) {
      return res.status(400).json({ error: 'Body must be an array of availability slots' });
    }

    // Process each slot
    for (const slot of availabilityData) {
      const { dayOfWeek, startTime, endTime, isAvailable } = slot;
      
      // Upsert: search by profileId and dayOfWeek, update or create
      await Availability.upsert({
        profileId: profile.id,
        dayOfWeek,
        startTime: startTime || null,
        endTime: endTime || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      });
    }

    const updatedItems = await Availability.findAll({ where: { profileId: profile.id } });
    res.status(200).json(updatedItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
