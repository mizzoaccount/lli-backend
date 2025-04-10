const Service = require('../models/serviceModel');

// @desc    Create a new service
// @route   POST /api/v1/services
// @access  Public (You can secure later with middleware)
const createService = async (req, res) => {
  try {
    const { title, description, icon, features, details } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const service = await Service.create({
      title,
      description,
      icon,
      features,
      details,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createService,
};
