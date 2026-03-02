const express = require('express');
const { saveNews, getSavedNews, deleteSavedNews, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/save', protect, saveNews);
router.get('/saved', protect, getSavedNews);
router.delete('/saved/:id', protect, deleteSavedNews);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
