// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  addResource,
  updateResource,
  deleteResource,
  uploadFile,
} = require('../controllers/resourceController');


router.post('/upload', uploadFile);

// Routes for handling resources
router.route('/')
  .get(getResources) // Get all resources
  .post(addResource); // Add a new resource

router.route('/:id')
  .get(getResource) // Get a single resource by ID
  .put(updateResource) // Update a resource
  .delete(deleteResource); // Delete a resource

module.exports = router;
