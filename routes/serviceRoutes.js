const express = require('express');
const router = express.Router();
const { createService } = require('../controllers/serviceController');

router.post('/', createService);

module.exports = router;
