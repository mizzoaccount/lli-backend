/*const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }
  
    // Check for user
    const user = await User.findOne({ email }).select('+password');
  
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
  
    // Check if password matches
    const isMatch = await user.matchPassword(password);
  
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
  
    sendTokenResponse(user, 200, res);
  });



// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, password, programInterest } = req.body;

  // Create user
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    programInterest,
  });

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        programInterest: user.programInterest,
      },
    });
};*/

const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, password, programInterest } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    return next(new ErrorResponse('Email already in use', 400));
  }

  // Create user (not verified yet)
  console.log(`Creating user with email: ${email}`);
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    programInterest,
  });

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  console.log(`Generated verification token: ${verificationToken}`);
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `http://localhost:5000/api/v1/auth/verifyemail/${verificationToken}`;
 // const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${verificationToken}`;
  console.log(`Verification URL: ${verificationUrl}`);

  try {
    // Send verification email using Resend
    console.log(`Sending email to: ${user.email}`);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verify Your Email Address</h2>
          <p>Hello ${user.fullName},</p>
          <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
          <div style="margin: 25px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If you did not create an account, please ignore this email.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This verification link will expire in 10 minutes.
          </p>
        </div>
      `
    });

    console.log(`Verification email sent to ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Registration successful. Please check your email for verification instructions.'
    });
  } catch (err) {
    console.error('Error sending email:', err);
    // If email fails to send, remove the user and token
    await User.findByIdAndDelete(user._id);
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(`Received verification token: ${verificationToken}`);

  const user = await User.findOne({
    verificationToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    console.log('Invalid or expired token.');
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Mark user as verified and clear token fields
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  console.log(`User with email ${user.email} verified successfully.`);

  // Send response or redirect
  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if email is verified
  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email before logging in', 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        programInterest: user.programInterest,
      },
    });
};


// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('No user found with this email', 404));
  }

  if (user.isVerified) {
    return next(new ErrorResponse('Email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `http://localhost:5000/api/v1/auth/verifyemail/${verificationToken}`;

  try {
    // Send verification email using Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Email Verification (Resend)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verify Your Email Address</h2>
          <p>Hello ${user.fullName},</p>
          <p>We received a request to resend the verification email. Please click the button below to verify your email address:</p>
          <div style="margin: 25px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This verification link will expire in 10 minutes.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Verification email resent successfully'
    });
  } catch (err) {
    console.error('Error resending email:', err);
    
    // Clear the token if email fails
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

