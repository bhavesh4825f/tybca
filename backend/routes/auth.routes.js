const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, changePassword, uploadProfilePhoto } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);

module.exports = router;
