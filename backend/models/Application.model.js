const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    unique: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  documents: [{
    documentType: String,
    documentPath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed', 'Pending Documents'],
    default: 'Submitted'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  remarks: [{
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  applicationData: {
    type: mongoose.Schema.Types.Mixed
  },
  payment: {
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Online', 'Card', 'UPI'],
      default: null
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedDocument: {
    documentPath: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  editingEnabled: {
    type: Boolean,
    default: false
  },
  editingReason: {
    type: String,
    default: null
  },
  enabledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  enabledAt: {
    type: Date,
    default: null
  },
  previousVersions: [{
    applicationData: mongoose.Schema.Types.Mixed,
    documents: [{
      documentType: String,
      documentPath: String,
      uploadedAt: Date
    }],
    savedAt: {
      type: Date,
      default: Date.now
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lastEditedAt: {
    type: Date,
    default: null
  }
});

// Generate application number before saving
applicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationNumber) {
    try {
      const count = await mongoose.model('Application').countDocuments();
      const timestamp = Date.now();
      this.applicationNumber = `APP${timestamp}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
