const Application = require('../models/Application.model');
const Service = require('../models/Service.model');

// @desc    Update payment status
// @route   PUT /api/payments/:applicationId
// @access  Private (Admin/Consultant)
exports.updatePayment = async (req, res) => {
  try {
    const { amount, status, transactionId, paymentMethod } = req.body;

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.payment = {
      amount,
      status,
      transactionId,
      paymentMethod,
      paidAt: status === 'Paid' ? new Date() : null
    };

    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Process payment for application
// @route   POST /api/payments/:applicationId/process
// @access  Private (Citizen)
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const application = await Application.findOne({
      _id: req.params.applicationId,
      citizen: req.user.id
    }).populate('service');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Get service fee
    const serviceFee = application.service.fee || 0;

    // Update payment
    application.payment = {
      amount: serviceFee,
      status: 'Paid',
      transactionId: transactionId || `TXN${Date.now()}`,
      paymentMethod,
      paidAt: new Date()
    };

    await application.save();

    res.status(200).json({ 
      success: true, 
      message: 'Payment processed successfully',
      data: application 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:applicationId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .select('payment applicationNumber')
      .populate('service', 'name fee');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all payment transactions (Admin)
// @route   GET /api/payments/all/transactions
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const applications = await Application.find({ 'payment.status': 'Paid' })
      .select('applicationNumber payment status createdAt')
      .populate('citizen', 'name email')
      .populate('service', 'name')
      .sort({ 'payment.paidAt': -1 });

    const transactions = applications.map(app => ({
      _id: app._id,
      applicationNumber: app.applicationNumber,
      citizenName: app.citizen?.name,
      citizenEmail: app.citizen?.email,
      serviceName: app.service?.name,
      amount: app.payment?.amount,
      transactionId: app.payment?.transactionId,
      paymentMethod: app.payment?.paymentMethod,
      paidAt: app.payment?.paidAt,
      status: app.payment?.status
    }));

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get citizen's payment transactions
// @route   GET /api/payments/my/transactions
// @access  Private (Citizen)
exports.getMyPayments = async (req, res) => {
  try {
    const applications = await Application.find({ 
      citizen: req.user.id,
      'payment.status': 'Paid' 
    })
      .select('applicationNumber payment status createdAt')
      .populate('service', 'name')
      .sort({ 'payment.paidAt': -1 });

    const transactions = applications.map(app => ({
      _id: app._id,
      applicationNumber: app.applicationNumber,
      serviceName: app.service?.name,
      amount: app.payment?.amount,
      transactionId: app.payment?.transactionId,
      paymentMethod: app.payment?.paymentMethod,
      paidAt: app.payment?.paidAt,
      status: app.payment?.status
    }));

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = exports;
