const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/users/profile', profileController.protect, profileController.getProfile);
router.put('/users/profile', profileController.protect, profileController.updateProfile);

module.exports = router;

