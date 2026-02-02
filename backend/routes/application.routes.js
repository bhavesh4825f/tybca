const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  searchApplications,
  enableEditing,
  disableEditing,
  updateApplicationForm,
  submitEditedApplication,
  getApplicationVersions,
  getApplicationById
} = require('../controllers/application.controller');

router.get('/search', protect, searchApplications);
router.get('/:id', protect, getApplicationById);
router.get('/:id/versions', protect, getApplicationVersions);
router.put('/:id/enable-editing', protect, enableEditing);
router.put('/:id/disable-editing', protect, disableEditing);
router.put('/:id/edit-form', protect, updateApplicationForm);
router.put('/:id/submit-edited', protect, submitEditedApplication);

module.exports = router;
