const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  getAssignedApplications,
  getApplicationById,
  updateApplicationStatus,
  addRemark,
  uploadCompletedDocument
} = require('../controllers/consultant.controller');

// All routes require authentication and employee role
router.use(protect);
router.use(authorize('employee'));

router.get('/applications', getAssignedApplications);
router.get('/applications/:id', getApplicationById);
router.put('/applications/:id/status', updateApplicationStatus);
router.post('/applications/:id/remarks', addRemark);
router.post('/applications/:id/completed-document', upload.fields([{ name: 'document', maxCount: 1 }]), uploadCompletedDocument);

module.exports = router;
