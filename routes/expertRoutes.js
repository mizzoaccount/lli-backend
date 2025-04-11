const express = require('express');
const {
  getExperts,
  getExpert,
  createExpert,
  updateExpert,
  deleteExpert
} = require('../controllers/expertsController');
const router = express.Router();

router.route('/')
  .get(getExperts)
  .post(createExpert); // No need for upload middleware here now

router.route('/:id')
  .get(getExpert)
  .put(updateExpert)
  .delete(deleteExpert);

module.exports = router;