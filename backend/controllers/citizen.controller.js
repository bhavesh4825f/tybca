const Application = require('../models/Application.model');
const User = require('../models/User.model');

// @desc    Get all applications of logged in citizen
// @route   GET /api/citizen/applications
// @access  Private (Citizen)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ citizen: req.user.id })
      .populate('service', 'name category')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new application
// @route   POST /api/citizen/applications
// @access  Private (Citizen)
exports.createApplication = async (req, res) => {
  try {
    const { serviceId, applicationData } = req.body;

    // Get all employees for auto-assignment
    const employees = await User.find({ role: 'employee' });

    let assignedTo = null;
    
    if (employees.length > 0) {
      // Count applications assigned to each employee
      const employeeWorkload = await Promise.all(
        employees.map(async (employee) => {
          const count = await Application.countDocuments({
            assignedTo: employee._id,
            status: { $in: ['Submitted', 'Under Review', 'Pending Documents'] }
          });
          return { employeeId: employee._id, workload: count };
        })
      );

      // Sort by workload (ascending) and assign to employee with least workload
      employeeWorkload.sort((a, b) => a.workload - b.workload);
      assignedTo = employeeWorkload[0].employeeId;
    }

    const application = await Application.create({
      citizen: req.user.id,
      service: serviceId,
      applicationData,
      status: 'Submitted',
      assignedTo: assignedTo
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('service')
      .populate('assignedTo', 'name email');

    res.status(201).json({ success: true, data: populatedApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get application by ID
// @route   GET /api/citizen/applications/:id
// @access  Private (Citizen)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id
    })
      .populate('service')
      .populate('assignedTo', 'name email')
      .populate('completedDocument.uploadedBy', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Upload documents for application
// @route   POST /api/citizen/applications/:id/documents
// @access  Private (Citizen)
exports.uploadDocuments = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const documents = req.files.map(file => {
      // Store relative path for serving via express.static
      const relativePath = file.path.replace(/\\/g, '/').replace(/^.*uploads/, 'uploads');
      return {
        documentType: req.body.documentType || 'General',
        documentPath: relativePath
      };
    });

    application.documents.push(...documents);
    application.updatedAt = Date.now();
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Submit application for review (after documents and payment)
// @route   PUT /api/citizen/applications/:id/submit-for-review
// @access  Private (Citizen)
exports.submitForReview = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id
    }).populate('service');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Validate that all required documents are uploaded
    const requiredDocs = application.service?.requiredDocuments || [];
    if (requiredDocs.length > 0) {
      const uploadedDocTypes = application.documents.map(doc => doc.documentType);
      const missingDocs = requiredDocs.filter(docType => !uploadedDocTypes.includes(docType));
      
      if (missingDocs.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required documents: ${missingDocs.join(', ')}` 
        });
      }
    }

    // Validate that payment is completed
    if (!application.payment || 
        (application.payment.status !== 'Paid' && 
         application.payment.status !== 'Completed')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment must be completed before submitting application' 
      });
    }

    // Update status to Under Review
    application.status = 'Under Review';
    application.updatedAt = Date.now();
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('service')
      .populate('assignedTo', 'name email')
      .populate('citizen', 'name email');

    res.status(200).json({ 
      success: true, 
      message: 'Application submitted for review successfully',
      data: populatedApplication 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Edit application form data (when editing is enabled)
// @route   PUT /api/citizen/applications/:id/edit-form
// @access  Private (Citizen)
exports.editApplicationForm = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if editing is enabled
    if (!application.editingEnabled) {
      return res.status(403).json({ 
        success: false, 
        message: 'Editing is not enabled for this application' 
      });
    }

    // Update application data
    if (req.body.applicationData) {
      application.applicationData = req.body.applicationData;
    }

    application.lastEditedAt = Date.now();
    application.updatedAt = Date.now();
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('service')
      .populate('assignedTo', 'name email')
      .populate('enabledBy', 'name email');

    res.status(200).json({ 
      success: true, 
      message: 'Application updated successfully',
      data: populatedApplication 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Submit edited application
// @route   PUT /api/citizen/applications/:id/submit-edited
// @access  Private (Citizen)
exports.submitEditedApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id
    }).populate('service');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if editing is enabled
    if (!application.editingEnabled) {
      return res.status(403).json({ 
        success: false, 
        message: 'Editing is not enabled for this application' 
      });
    }

    // Validate that all required documents are uploaded
    const requiredDocs = application.service?.requiredDocuments || [];
    if (requiredDocs.length > 0) {
      const uploadedDocTypes = application.documents.map(doc => doc.documentType);
      const missingDocs = requiredDocs.filter(docType => !uploadedDocTypes.includes(docType));
      
      if (missingDocs.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required documents: ${missingDocs.join(', ')}` 
        });
      }
    }

    // Disable editing and update status
    application.editingEnabled = false;
    application.status = 'Under Review';
    application.lastEditedAt = Date.now();
    application.updatedAt = Date.now();
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('service')
      .populate('assignedTo', 'name email')
      .populate('citizen', 'name email');

    res.status(200).json({ 
      success: true, 
      message: 'Edited application submitted successfully',
      data: populatedApplication 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
