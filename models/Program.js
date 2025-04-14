const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: String, required: true },
  milestones: [{ type: String }],
  progress: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Program', programSchema);
