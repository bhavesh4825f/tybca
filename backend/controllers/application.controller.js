const Application = require('../models/Application.model');

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('service')
      .populate('assignedTo', 'name email')
      .populate('enabledBy', 'name email')
      .populate('completedDocument.uploadedBy', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check authorization
    if (req.user.role === 'citizen' && application.citizen._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'employee' && application.assignedTo && application.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Search applications
// @route   GET /api/applications/search
// @access  Private
exports.searchApplications = async (req, res) => {
  try {
    const { status, applicationNumber } = req.query;
    
    let query = {};

    // Role-based filtering
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    } else if (req.user.role === 'employee') {
      query.assignedTo = req.user.id;
    }

    // Additional filters
    if (status) {
      query.status = status;
    }

    if (applicationNumber) {
      query.applicationNumber = { $regex: applicationNumber, $options: 'i' };
    }

    const applications = await Application.find(query)
      .populate('citizen', 'name email')
      .populate('service', 'name category')
      .populate('assignedTo', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Enable editing for application (Admin/Consultant)
// @route   PUT /api/applications/:id/enable-editing
// @access  Private (Admin/Consultant)
exports.enableEditing = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Only admin or assigned employee can enable editing
    if (req.user.role !== 'admin' && req.user.role !== 'employee') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'employee' && application.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Save current version before enabling editing
    if (application.applicationData) {
      application.previousVersions.push({
        applicationData: application.applicationData,
        documents: application.documents,
        savedBy: req.user.id,
        savedAt: new Date()
      });
    }

    application.editingEnabled = true;
    application.editingReason = reason || '';
    application.enabledBy = req.user.id;
    application.enabledAt = new Date();

    await application.save();

    res.status(200).json({ 
      success: true, 
      message: 'Editing enabled successfully',
      data: application 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Disable editing for application (Admin/Consultant)
// @route   PUT /api/applications/:id/disable-editing
// @access  Private (Admin/Consultant)
exports.disableEditing = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Only admin or assigned employee can disable editing
    if (req.user.role !== 'admin' && req.user.role !== 'employee') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'employee' && application.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.editingEnabled = false;

    await application.save();

    res.status(200).json({ 
      success: true, 
      message: 'Editing disabled successfully',
      data: application 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update application data while editing
// @route   PUT /api/applications/:id/edit-form
// @access  Private (Citizen - only if editing enabled)
exports.updateApplicationForm = async (req, res) => {
  try {
    const { applicationData, documents } = req.body;
    
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id,
      editingEnabled: true
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found or editing is not enabled for this application' 
      });
    }

    // Update form data
    if (applicationData) {
      application.applicationData = applicationData;
    }

    // Update documents if provided
    if (documents && Array.isArray(documents)) {
      application.documents = documents;
    }

    application.lastEditedAt = new Date();

    await application.save();

    res.status(200).json({ 
      success: true, 
      message: 'Application updated successfully',
      data: application 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Submit edited application (Citizen)
// @route   PUT /api/applications/:id/submit-edited
// @access  Private (Citizen)
exports.submitEditedApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      citizen: req.user.id,
      editingEnabled: true
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found or editing is not enabled' 
      });
    }

    // Check if all required documents are uploaded (only if documents are required)
    if (application.documents && application.documents.length > 0) {
      const missingDocs = application.documents.filter(doc => !doc.documentPath);
      if (missingDocs.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please upload all required documents before submitting' 
        });
      }
    }

    application.editingEnabled = false;
    application.updatedAt = new Date();
    application.status = 'Submitted';

    await application.save();

    res.status(200).json({ 
      success: true, 
      message: 'Edited application submitted successfully',
      data: application 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get previous versions of application
// @route   GET /api/applications/:id/versions
// @access  Private (Admin/Consultant/Citizen)
exports.getApplicationVersions = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('previousVersions.savedBy', 'name email role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ 
      success: true, 
      data: application.previousVersions 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
