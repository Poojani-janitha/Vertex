const { Skill } = require('../models');

const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({ order: [['name', 'ASC']] });
    return res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    return res.status(500).json({ message: 'Server error retrieving skills.', error: error.message });
  }
};

module.exports = { getAllSkills };
