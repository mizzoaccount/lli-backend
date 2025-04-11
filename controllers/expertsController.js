const Expert = require('../models/Expert');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudinary = require('cloudinary').v2;


if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
  console.error('Missing Cloudinary configuration!');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// @desc    Get all experts
// @route   GET /api/v1/experts
// @access  Public
exports.getExperts = asyncHandler(async (req, res, next) => {
  const experts = await Expert.find();
  res.status(200).json({
    success: true,
    count: experts.length,
    data: experts
  });
});

// @desc    Get single expert
// @route   GET /api/v1/experts/:id
// @access  Public
exports.getExpert = asyncHandler(async (req, res, next) => {
  const expert = await Expert.findById(req.params.id);

  if (!expert) {
    return next(
      new ErrorResponse(`Expert not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: expert
  });
});

// @desc    Create new expert
// @route   POST /api/v1/experts
// @access  Private
exports.createExpert = asyncHandler(async (req, res, next) => {
  try {
    if (!req.files || !req.files.image) {
      return next(new ErrorResponse('Please upload an image', 400));
    }

    const file = req.files.image;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'legislative/experts',
      width: 500,
      height: 500,
      crop: 'fill'
    });

    // Handle specialties (could be stringified array or already parsed)
    let specialties = [];
    if (req.body.specialties) {
      try {
        specialties = JSON.parse(req.body.specialties);
      } catch (e) {
        specialties = Array.isArray(req.body.specialties) 
          ? req.body.specialties 
          : [req.body.specialties];
      }
    }

    const expert = await Expert.create({
      name: req.body.name,
      role: req.body.role,
      experience: req.body.experience,
      bio: req.body.bio,
      email: req.body.email,
      phone: req.body.phone,
      social: {
        twitter: req.body['social[twitter]'] || req.body.social?.twitter || '',
        linkedin: req.body['social[linkedin]'] || req.body.social?.linkedin || ''
      },
      specialties,
      image: result.secure_url
    });

    res.status(201).json({
      success: true,
      data: expert
    });
  } catch (err) {
    console.error('Error creating expert:', err);
    next(new ErrorResponse(err.message || 'Failed to create expert', 500));
  }
});


// @desc    Update expert
// @route   PUT /api/v1/experts/:id
// @access  Private
exports.updateExpert = asyncHandler(async (req, res, next) => {
  let expert = await Expert.findById(req.params.id);

  if (!expert) {
    return next(
      new ErrorResponse(`Expert not found with id of ${req.params.id}`, 404)
    );
  }

  // Handle image upload if new image is provided
  if (req.files && req.files.image) {
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'legislative/experts',
      width: 500,
      height: 500,
      crop: 'fill'
    });

    // Delete old image from Cloudinary if it exists
    if (expert.image) {
      const publicId = expert.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`legislative/experts/${publicId}`);
    }

    expert = await Expert.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: result.secure_url },
      {
        new: true,
        runValidators: true
      }
    );
  } else {
    expert = await Expert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({
    success: true,
    data: expert
  });
});

// @desc    Delete expert
// @route   DELETE /api/v1/experts/:id
// @access  Private
exports.deleteExpert = asyncHandler(async (req, res, next) => {
  const expert = await Expert.findById(req.params.id);

  if (!expert) {
    return next(
      new ErrorResponse(`Expert not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete image from Cloudinary if it exists
  if (expert.image) {
    const publicId = expert.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`legislative/experts/${publicId}`);
  }

  await expert.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});