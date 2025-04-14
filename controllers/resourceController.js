// controllers/resourceController.js
const Resource = require('../models/Resource');
const path = require('path');
const fs = require('fs');

// Endpoint to handle file upload
exports.uploadFile = (req, res) => {
  const file = req.files?.file;
  if (!file) return res.status(400).send('No file uploaded.');

  const filePath = path.join(__dirname, '..', 'uploads', file.name);

  file.mv(filePath, (err) => {
    if (err) return res.status(500).send(err);

    // Respond with the file URL (or path)
    res.status(200).json({ fileUrl: `/uploads/${file.name}` });
  });
};


// @desc    Get all resources
// @route   GET /api/v1/resources
exports.getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find();
    res.status(200).json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single resource by ID
// @route   GET /api/v1/resources/:id
exports.getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a new resource
// @route   POST /api/v1/resources
exports.addResource = async (req, res, next) => {
  try {
    const { title, category, description, date, pages } = req.body;

    // Ensure file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const filePath = path.join(__dirname, '../uploads', file.name);

    // Move file to the uploads folder
    file.mv(filePath, async (err) => {
      if (err) return res.status(500).send(err);

      const newResource = new Resource({
        title,
        category,
        description,
        link: `/uploads/${file.name}`, // Link to the file
        date,
        pages,
      });

      await newResource.save();
      res.status(201).json({ success: true, data: newResource });
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a resource
// @route   PUT /api/v1/resources/:id
exports.updateResource = async (req, res, next) => {
  try {
    const { title, category, description, date, pages } = req.body;

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, category, description, date, pages },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/v1/resources/:id
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
};
