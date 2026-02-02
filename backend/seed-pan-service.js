require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service.model');
const User = require('./models/User.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const createPANService = async () => {
  try {
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Check if PAN service already exists
    const existingService = await Service.findOne({ name: 'PAN Card Application' });
    
    if (existingService) {
      console.log('PAN Card Application service already exists. Updating...');
      existingService.formSchema = [
        {
          fieldName: 'applicantName',
          fieldLabel: 'Full Name (as per Aadhar)',
          fieldType: 'text',
          required: true,
          placeholder: 'Enter your full name',
          validation: {
            minLength: 3,
            maxLength: 100
          },
          order: 1
        },
        {
          fieldName: 'fatherName',
          fieldLabel: "Father's Name",
          fieldType: 'text',
          required: true,
          placeholder: "Enter father's name",
          validation: {
            minLength: 3
          },
          order: 2
        },
        {
          fieldName: 'dob',
          fieldLabel: 'Date of Birth',
          fieldType: 'date',
          required: true,
          order: 3
        },
        {
          fieldName: 'gender',
          fieldLabel: 'Gender',
          fieldType: 'select',
          required: true,
          options: ['Male', 'Female', 'Transgender'],
          order: 4
        },
        {
          fieldName: 'email',
          fieldLabel: 'Email Address',
          fieldType: 'email',
          required: true,
          placeholder: 'your.email@example.com',
          order: 5
        },
        {
          fieldName: 'mobile',
          fieldLabel: 'Mobile Number',
          fieldType: 'tel',
          required: true,
          placeholder: '10-digit mobile number',
          validation: {
            pattern: '^[0-9]{10}$',
            message: 'Enter valid 10-digit mobile number'
          },
          order: 6
        },
        {
          fieldName: 'address',
          fieldLabel: 'Permanent Address',
          fieldType: 'textarea',
          required: true,
          placeholder: 'Enter your complete address',
          validation: {
            minLength: 10,
            maxLength: 500
          },
          order: 7
        },
        {
          fieldName: 'aadharNumber',
          fieldLabel: 'Aadhar Number',
          fieldType: 'text',
          required: true,
          placeholder: '12-digit Aadhar number',
          validation: {
            pattern: '^[0-9]{12}$',
            message: 'Enter valid 12-digit Aadhar number'
          },
          order: 8
        }
      ];
      
      await existingService.save();
      console.log('✅ PAN Card Application service updated successfully!');
    } else {
      const panService = await Service.create({
        name: 'PAN Card Application',
        description: 'Apply for Permanent Account Number (PAN) Card issued by Income Tax Department',
        category: 'Certificate',
        fee: 110,
        processingTime: '15-20 days',
        eligibilityCriteria: 'Indian citizens and NRIs can apply',
        requiredDocuments: [
          'Aadhar Card',
          'Passport size photograph',
          'Proof of address',
          'Date of birth proof'
        ],
        isActive: true,
        createdBy: admin._id,
        formSchema: [
          {
            fieldName: 'applicantName',
            fieldLabel: 'Full Name (as per Aadhar)',
            fieldType: 'text',
            required: true,
            placeholder: 'Enter your full name',
            validation: {
              minLength: 3,
              maxLength: 100
            },
            order: 1
          },
          {
            fieldName: 'fatherName',
            fieldLabel: "Father's Name",
            fieldType: 'text',
            required: true,
            placeholder: "Enter father's name",
            validation: {
              minLength: 3
            },
            order: 2
          },
          {
            fieldName: 'dob',
            fieldLabel: 'Date of Birth',
            fieldType: 'date',
            required: true,
            order: 3
          },
          {
            fieldName: 'gender',
            fieldLabel: 'Gender',
            fieldType: 'select',
            required: true,
            options: ['Male', 'Female', 'Transgender'],
            order: 4
          },
          {
            fieldName: 'email',
            fieldLabel: 'Email Address',
            fieldType: 'email',
            required: true,
            placeholder: 'your.email@example.com',
            order: 5
          },
          {
            fieldName: 'mobile',
            fieldLabel: 'Mobile Number',
            fieldType: 'tel',
            required: true,
            placeholder: '10-digit mobile number',
            validation: {
              pattern: '^[0-9]{10}$',
              message: 'Enter valid 10-digit mobile number'
            },
            order: 6
          },
          {
            fieldName: 'address',
            fieldLabel: 'Permanent Address',
            fieldType: 'textarea',
            required: true,
            placeholder: 'Enter your complete address',
            validation: {
              minLength: 10,
              maxLength: 500
            },
            order: 7
          },
          {
            fieldName: 'aadharNumber',
            fieldLabel: 'Aadhar Number',
            fieldType: 'text',
            required: true,
            placeholder: '12-digit Aadhar number',
            validation: {
              pattern: '^[0-9]{12}$',
              message: 'Enter valid 12-digit Aadhar number'
            },
            order: 8
          }
        ]
      });

      console.log('✅ PAN Card Application service created successfully!');
      console.log(`Service ID: ${panService._id}`);
    }

    console.log('\n📋 Service Details:');
    console.log('- Name: PAN Card Application');
    console.log('- Fee: ₹110');
    console.log('- Form Fields: 8 fields');
    console.log('\nYou can now test the dynamic form by applying for this service!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating service:', error);
    process.exit(1);
  }
};

createPANService();
