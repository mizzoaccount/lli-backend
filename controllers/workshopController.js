const Workshop = require('../models/workshopModel');
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
