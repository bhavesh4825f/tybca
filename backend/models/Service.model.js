const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide service name'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide service description']
  },
  category: {
    type: String,
    required: true,
    enum: ['Certificate', 'License', 'Registration', 'Pension', 'Subsidy', 'Other']
  },
  requiredDocuments: [{
    type: String
  }],
  formSchema: [{
    fieldName: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    fieldType: { 
      type: String, 
      required: true,
      enum: ['text', 'email', 'number', 'tel', 'date', 'select', 'textarea', 'file', 'checkbox', 'radio']
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    options: [String], // For select, radio, checkbox
    validation: {
      minLength: Number,
      maxLength: Number,
      min: Number,
      max: Number,
      pattern: String,
      message: String
    },
    order: { type: Number, default: 0 }
  }],
  processingTime: {
    type: String,
    default: '7-10 days'
  },
  fee: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  eligibilityCriteria: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);
