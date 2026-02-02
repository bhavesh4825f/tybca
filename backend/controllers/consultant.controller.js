const Application = require('../models/Application.model');

// @desc    Get all applications assigned to employee
// @route   GET /api/employee/applications
// @access  Private (Employee)
exports.getAssignedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ assignedTo: req.user.id })
      .populate('citizen', 'name email phone')
      .populate('service', 'name category')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get application by ID
// @route   GET /api/employee/applications/:id
// @access  Private (Employee)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      assignedTo: req.user.id
    })
      .populate('citizen', 'name email phone')
      .populate('service', 'name category')
      .populate('assignedTo', 'name email')
      .populate('remarks.by', 'name')
      .populate('completedDocument.uploadedBy', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or not assigned to you' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/employee/applications/:id/status
// @access  Private (Employee)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      assignedTo: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or not assigned to you' });
    }

    application.status = status;
    application.updatedAt = Date.now();

    if (status === 'Completed') {
      application.completedAt = Date.now();
    }

    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add remark to application
// @route   POST /api/employee/applications/:id/remarks
// @access  Private (Employee)
exports.addRemark = async (req, res) => {
  try {
    const { comment } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      assignedTo: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or not assigned to you' });
    }

    application.remarks.push({
      by: req.user.id,
      comment,
      timestamp: Date.now()
    });

    application.updatedAt = Date.now();
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Upload completed document
// @route   POST /api/employee/applications/:id/completed-document
// @access  Private (Employee)
exports.uploadCompletedDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.document || req.files.document.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload a document' });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      assignedTo: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or not assigned to you' });
    }

    const file = req.files.document[0];
    // Store relative path for serving via express.static
    const relativePath = file.path.replace(/\\/g, '/').replace(/^.*uploads/, 'uploads');
    application.completedDocument = {
      documentPath: relativePath,
      uploadedAt: Date.now(),
      uploadedBy: req.user.id
    };

    await application.save();

    const populatedApp = await Application.findById(application._id)
      .populate('citizen', 'name email phone')
      .populate('service', 'name category')
      .populate('assignedTo', 'name email')
      .populate('completedDocument.uploadedBy', 'name email');

    res.status(200).json({ success: true, message: 'Document uploaded successfully', data: populatedApp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
