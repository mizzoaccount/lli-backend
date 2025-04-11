const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  seats: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Workshop', workshopSchema);
