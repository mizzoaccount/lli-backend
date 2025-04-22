// routes/subscriptionRoutes.js
const express = require('express');
const { subscribe, verifySubscription, resendVerification } = require('../controllers/subscriptionController');
const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/verify-subscription/:token', verifySubscription);
router.post('/resend-verification', resendVerification);

module.exports = router;