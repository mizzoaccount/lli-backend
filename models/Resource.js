// models/Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true }, // Link to the uploaded file
  date: { type: String, required: true },
  pages: { type: String, required: true },
});

module.exports = mongoose.model('Resource', ResourceSchema);
