// models/Subscriber.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date
});

// Generate email verification token
SubscriberSchema.methods.getVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to verificationToken field
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.verificationTokenExpire = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

module.exports = mongoose.model('Subscriber', SubscriberSchema);