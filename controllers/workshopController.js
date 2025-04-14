/*const Workshop = require('../models/workshopModel');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.createWorkshop = async (req, res) => {
  try {
    const {
      title,
      date,
      location,
      description,
      seats,
      type,
      duration,
      price
    } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageFile = req.files.image;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'workshops',
      resource_type: 'image',
    });

    const workshop = await Workshop.create({
      title,
      date,
      location,
      description,
      image: result.secure_url,
      seats,
      type,
      duration,
      price
    });

    res.status(201).json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    console.error('Workshop creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
*/

const Workshop = require('../models/workshopModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// @desc    Create new workshop
exports.createWorkshop = async (req, res) => {
  try {
    const {
      title,
      date,
      location,
      description,
      seats,
      type,
      duration,
      price,
    } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageFile = req.files.image;

    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'workshops',
      resource_type: 'image',
    });

    const workshop = await Workshop.create({
      title,
      date,
      location,
      description,
      image: result.secure_url,
      seats,
      type,
      duration,
      price,
    });

    res.status(201).json({ success: true, data: workshop });
  } catch (error) {
    console.error('Workshop creation failed:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all workshops
exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find();
    res.status(200).json({ success: true, data: workshops });
  } catch (error) {
    console.error('Fetching all workshops failed:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get workshop by ID
exports.getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }
    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    console.error('Fetching workshop failed:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update workshop
exports.updateWorkshop = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          folder: 'workshops',
          resource_type: 'image',
        }
      );
      updateData.image = result.secure_url;
    }

    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedWorkshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }

    res.status(200).json({ success: true, data: updatedWorkshop });
  } catch (error) {
    console.error('Updating workshop failed:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete workshop
exports.deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }

    res.status(200).json({ success: true, message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Deleting workshop failed:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
