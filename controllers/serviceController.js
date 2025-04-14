/*const Service = require('../models/serviceModel');

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
};*/

const Service = require('../models/serviceModel');

// @desc    Create a new service
// @route   POST /api/v1/services
// @access  Public
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

// @desc    Get all services
// @route   GET /api/v1/services
// @access  Public
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single service by ID
// @route   GET /api/v1/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error getting service:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a service
// @route   PUT /api/v1/services/:id
// @access  Public
const updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/v1/services/:id
// @access  Public
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};

