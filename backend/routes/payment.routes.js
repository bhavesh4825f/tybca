const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  updatePayment,
  processPayment,
  getPaymentDetails,
  getAllPayments,
  getMyPayments
} = require('../controllers/payment.controller');

// Get all payments (Admin)
router.get('/all/transactions', protect, authorize('admin'), getAllPayments);

// Get my payments (Citizen)
router.get('/my/transactions', protect, authorize('citizen'), getMyPayments);

// Payment routes
router.route('/:applicationId')
  .get(protect, getPaymentDetails)
  .put(protect, authorize('admin', 'employee'), updatePayment);

router.post('/:applicationId/process', protect, authorize('citizen'), processPayment);

module.exports = router;
