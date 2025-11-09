const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const profileController = require('../controllers/profileController');

// Tất cả routes đều cần authentication
// GET /users - Chỉ Admin mới được xem danh sách users
router.get('/users', profileController.protect, profileController.authorize('admin'), userController.getUsers);

// POST /users - Chỉ Admin mới được tạo user mới
router.post('/users', profileController.protect, profileController.authorize('admin'), userController.createUser);

// PUT /users/:id - Admin có thể update bất kỳ user nào, user có thể update chính mình
router.put('/users/:id', profileController.protect, userController.updateUser);

// DELETE /users/:id - Admin có thể xóa bất kỳ user nào, user có thể xóa chính mình
router.delete('/users/:id', profileController.protect, userController.deleteUser);

module.exports = router;
