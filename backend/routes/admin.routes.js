const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllApplications,
  getApplicationById,
  assignApplication,
  autoAssignApplication,
  getDashboardStats,
  uploadCompletedDocument,
  deleteApplication,
  addRemark,
  initializeAdmin
} = require('../controllers/admin.controller');

// Public route to initialize admin (one-time setup)
router.post('/initialize', initializeAdmin);

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.put('/applications/:id/assign', assignApplication);
router.post('/applications/:id/auto-assign', autoAssignApplication);
router.post('/applications/:id/remarks', addRemark);
router.post('/applications/:id/completed-document', upload.fields([{ name: 'document', maxCount: 1 }]), uploadCompletedDocument);
router.delete('/applications/:id', deleteApplication);

router.get('/dashboard', getDashboardStats);

module.exports = router;
