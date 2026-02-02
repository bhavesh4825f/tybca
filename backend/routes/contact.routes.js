const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route - Submit contact form
router.post('/submit', contactController.submitContact);

// Admin routes - Manage contact queries
router.get('/queries', protect, authorize('admin'), contactController.getContactQueries);
router.put('/queries/:id/status', protect, authorize('admin'), contactController.updateContactStatus);
router.delete('/queries/:id', protect, authorize('admin'), contactController.deleteContactQuery);

module.exports = router;
