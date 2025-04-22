// controllers/subscriptionController.js
const Subscriber = require('../models/Subscriber');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Subscribe to newsletter
// @route   POST /api/v1/subscribe
// @access  Public

exports.subscribe = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
  
    console.log('[Subscribe] Incoming request with email:', email);
  
    // Validate email
    if (!email) {
      console.warn('[Subscribe] No email provided');
      return next(new ErrorResponse('Please provide an email address', 400));
    }
  
    // Check if already subscribed and verified
    const existingSubscriber = await Subscriber.findOne({ email, isVerified: true });
    if (existingSubscriber) {
      console.warn('[Subscribe] Email already verified:', email);
      return next(new ErrorResponse('This email is already subscribed', 400));
    }
  
    // Check if exists but not verified
    let subscriber = await Subscriber.findOne({ email, isVerified: false });
  
    if (!subscriber) {
      console.log('[Subscribe] Creating new subscriber for:', email);
      subscriber = await Subscriber.create({ email });
    } else {
      console.log('[Subscribe] Existing unverified subscriber found:', subscriber.email);
    }
  
    // Generate verification token
    const verificationToken = subscriber.getVerificationToken();
    await subscriber.save({ validateBeforeSave: false });
    console.log('[Subscribe] Verification token generated:', verificationToken);
  
    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-subscription/${verificationToken}`;
    console.log('[Subscribe] Verification URL:', verificationUrl);
  
    try {
      // Send verification email
      const response = await resend.emails.send({
        from: 'newsletter@legislativeleadershipinstitute.com',
        to: subscriber.email,
        subject: 'Confirm Your Subscription',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Confirm Your Subscription</h2>
            <p>Thank you for subscribing to our newsletter!</p>
            <p>Please click the button below to confirm your subscription:</p>
            <div style="margin: 25px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Confirm Subscription
              </a>
            </div>
            <p>If you did not request this subscription, please ignore this email.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              This confirmation link will expire in 10 minutes.
            </p>
          </div>
        `
      });
  
      console.log('[Subscribe] Verification email sent:', response);
  
      res.status(200).json({
        success: true,
        message: 'Subscription request received. Please check your email to confirm.'
      });
    } catch (err) {
      console.error('[Subscribe] Error sending email:', err);
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  });
  
{/*exports.subscribe = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  // Check if already subscribed and verified
  const existingSubscriber = await Subscriber.findOne({ email, isVerified: true });
  if (existingSubscriber) {
    return next(new ErrorResponse('This email is already subscribed', 400));
  }

  // Check if exists but not verified
  let subscriber = await Subscriber.findOne({ email, isVerified: false });
  
  if (!subscriber) {
    // Create new subscriber
    subscriber = await Subscriber.create({ email });
  }

  // Generate verification token
  const verificationToken = subscriber.getVerificationToken();
  await subscriber.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-subscription/${verificationToken}`;

  try {
    // Send verification email
    await resend.emails.send({
      from: 'newsletter@legislativeleadershipinstitute.com',
      to: subscriber.email,
      subject: 'Confirm Your Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Confirm Your Subscription</h2>
          <p>Thank you for subscribing to our newsletter!</p>
          <p>Please click the button below to confirm your subscription:</p>
          <div style="margin: 25px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirm Subscription
            </a>
          </div>
          <p>If you did not request this subscription, please ignore this email.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This confirmation link will expire in 10 minutes.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Subscription request received. Please check your email to confirm.'
    });
  } catch (err) {
    console.error('Error sending email:', err);
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});*/}

// @desc    Verify subscription
// @route   GET /api/v1/verify-subscription/:token
// @access  Public
exports.verifySubscription = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const subscriber = await Subscriber.findOne({
    verificationToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!subscriber) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Mark as verified and clear token
  subscriber.isVerified = true;
  subscriber.verificationToken = undefined;
  subscriber.verificationTokenExpire = undefined;
  await subscriber.save();

  // Send welcome email
  try {
    await resend.emails.send({
      from: 'newsletter@legislativeleadershipinstitute.com',
      to: subscriber.email,
      subject: 'Welcome to Our Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Subscription Confirmed!</h2>
          <p>Thank you for confirming your subscription to our newsletter.</p>
          <p>You'll now receive our latest updates, resources, and insights directly to your inbox.</p>
          <p>If you ever wish to unsubscribe, you can do so by clicking the unsubscribe link in any of our emails.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Legislative Leadership Institute Team
          </p>
        </div>
      `
    });
  } catch (err) {
    console.error('Error sending welcome email:', err);
  }

  res.status(200).json({
    success: true,
    message: 'Subscription confirmed successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  const subscriber = await Subscriber.findOne({ email });

  if (!subscriber) {
    return next(new ErrorResponse('No subscription found with this email', 404));
  }

  if (subscriber.isVerified) {
    return next(new ErrorResponse('This email is already verified', 400));
  }

  // Generate new token
  const verificationToken = subscriber.getVerificationToken();
  await subscriber.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-subscription/${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'newsletter@legislativeleadershipinstitute.com',
      to: subscriber.email,
      subject: 'Confirm Your Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Confirm Your Subscription</h2>
          <p>We received a request to resend the confirmation email. Please click the button below to confirm your subscription:</p>
          <div style="margin: 25px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirm Subscription
            </a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This confirmation link will expire in 10 minutes.
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
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});