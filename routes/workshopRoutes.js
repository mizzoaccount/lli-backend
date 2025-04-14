/*const express = require('express');
const router = express.Router();
const { createWorkshop } = require('../controllers/workshopController');

// POST /api/v1/workshops
router.post('/', createWorkshop);

module.exports = router;*/

const express = require('express');
const router = express.Router();
const {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
} = require('../controllers/workshopController');

// POST /api/v1/workshops
router.post('/', createWorkshop);

// GET all workshops
router.get('/', getAllWorkshops);

// GET single workshop by ID
router.get('/:id', getWorkshopById);

// PUT update workshop
router.put('/:id', updateWorkshop);

// DELETE workshop
router.delete('/:id', deleteWorkshop);

module.exports = router;

