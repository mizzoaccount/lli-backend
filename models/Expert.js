const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Please select a role'],
    enum: [
      'Parliamentary Procedures Expert',
      'Public Finance Specialist',
      'Constitutional Law Expert',
      'Governance Strategist',
      'Legislative Tech Innovator',
      'Legislative Drafting'
    ]
  },
  experience: {
    type: String,
    required: [true, 'Please add experience'],
    maxlength: [20, 'Experience cannot be more than 20 characters']
  },
  bio: {
    type: String,
    required: [true, 'Please add a bio'],
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Please upload an image']
  },
  social: {
    twitter: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    linkedin: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    }
  },
  specialties: {
    type: [String],
    required: [true, 'Please add at least one specialty'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Please add at least one specialty'
    }
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expert', ExpertSchema);