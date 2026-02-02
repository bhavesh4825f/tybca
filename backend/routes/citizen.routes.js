const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getMyApplications,
  createApplication,
  getApplicationById,
  uploadDocuments,
  submitForReview,
  editApplicationForm,
  submitEditedApplication
} = require('../controllers/citizen.controller');
const upload = require('../middleware/upload.middleware');

// All routes require authentication and citizen role
router.use(protect);
router.use(authorize('citizen'));

router.get('/applications', getMyApplications);
router.post('/applications', createApplication);
router.get('/applications/:id', getApplicationById);
router.post('/applications/:id/documents', upload.array('documents', 5), uploadDocuments);
router.put('/applications/:id/submit-for-review', submitForReview);
router.put('/applications/:id/edit-form', editApplicationForm);
router.put('/applications/:id/submit-edited', submitEditedApplication);

module.exports = router;
