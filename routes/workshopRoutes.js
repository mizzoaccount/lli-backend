const express = require('express');
const router = express.Router();
const { createWorkshop } = require('../controllers/workshopController');

// POST /api/v1/workshops
router.post('/', createWorkshop);

module.exports = router;
