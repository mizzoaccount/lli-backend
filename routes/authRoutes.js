/*const express = require('express');

const {
    register,
    login
  } = require('../controllers/authController');
  
const router = express.Router();

router.post('/register', register);
router.post('/login', login);


module.exports = router;*/

const express = require('express');
const {
  register,
  login,
  verifyEmail,
  resendVerification 
} = require('../controllers/authController');

const router = express.Router();

// Register and login routes
router.post('/register', register);
router.post('/login', login);

// Email verification routes
router.get('/verifyemail/:token', verifyEmail);
router.post('/resend-verification', resendVerification);  
module.exports = router;