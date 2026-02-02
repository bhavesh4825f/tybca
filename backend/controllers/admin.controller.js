const User = require('../models/User.model');
const Application = require('../models/Application.model');

// @desc    Initialize admin user (one-time setup)
// @route   POST /api/admin/initialize
// @access  Public (but checks if admin exists)
exports.initializeAdmin = async (req, res) => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin user already exists. Cannot initialize again.' 
      });
    }

    // Admin user data
    const adminData = {
      name: 'Admin User',
      email: 'admin@dgsc.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      address: {
        street: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        pincode: '000000'
      },
      isActive: true
    };

    // Create admin user
    const admin = await User.create(adminData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Admin user created successfully!',
      data: {
        email: admin.email,
        role: admin.role,
        note: 'Password is admin123'
      }
    });
  } catch (error) {
    console.error('Error initializing admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: messages 
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('citizen', 'name email phone')
      .populate('service', 'name category')
      .populate('assignedTo', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get application by ID
// @route   GET /api/admin/applications/:id
// @access  Private (Admin)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('service', 'name category')
      .populate('assignedTo', 'name email')
      .populate('remarks.by', 'name')
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

// @desc    Assign application to employee
// @route   PUT /api/admin/applications/:id/assign
// @access  Private (Admin)
exports.assignApplication = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Verify employee exists
    const employee = await User.findOne({ _id: employeeId, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { assignedTo: employeeId, status: 'Under Review', updatedAt: Date.now() },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Auto-assign application to employee with least workload
// @route   POST /api/admin/applications/:id/auto-assign
// @access  Private (Admin)
exports.autoAssignApplication = async (req, res) => {
  try {
    // Get all employees
    const employees = await User.find({ role: 'employee' });

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No employees available' });
    }

    // Count applications assigned to each employee
    const employeeWorkload = await Promise.all(
      employees.map(async (employee) => {
        const count = await Application.countDocuments({
          assignedTo: employee._id,
          status: { $in: ['Submitted', 'Under Review', 'Pending Documents'] }
        });
        return { employeeId: employee._id, workload: count, employee };
      })
    );

    // Sort by workload (ascending) and assign to employee with least workload
    employeeWorkload.sort((a, b) => a.workload - b.workload);
    const selectedEmployee = employeeWorkload[0].employeeId;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { assignedTo: selectedEmployee, status: 'Under Review', updatedAt: Date.now() },
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('citizen', 'name email')
     .populate('service', 'name');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Application assigned to ${employeeWorkload[0].employee.name}`,
      data: application 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalApplications = await Application.countDocuments();
    
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCitizens,
        totalEmployees,
        totalApplications,
        applicationsByStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add remark to application (Admin)
// @route   POST /api/admin/applications/:id/remarks
// @access  Private (Admin)
exports.addRemark = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.remarks.push({
      by: req.user.id,
      comment: comment.trim(),
      timestamp: Date.now()
    });

    await application.save();

    const populatedApp = await Application.findById(application._id)
      .populate('remarks.by', 'name email');

    res.status(200).json({ success: true, message: 'Remark added successfully', data: populatedApp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Upload completed document (Admin)
// @route   POST /api/admin/applications/:id/completed-document
// @access  Private (Admin)
exports.uploadCompletedDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.document || req.files.document.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload a document' });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
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

// @desc    Delete application
// @route   DELETE /api/admin/applications/:id
// @access  Private (Admin)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
