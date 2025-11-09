const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const uploadController = require('../controllers/uploadController');

router.get('/users/profile', profileController.protect, profileController.getProfile);
router.put('/users/profile', profileController.protect, profileController.updateProfile);
router.post('/users/upload-avatar', 
  profileController.protect, 
  uploadController.uploadAvatar, 
  uploadController.uploadAvatarHandler
);

module.exports = router;

