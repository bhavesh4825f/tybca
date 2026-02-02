# Dynamic Form Builder Documentation

## Overview
The Dynamic Form Builder allows administrators to create custom application forms for each government service without code changes. Forms are defined using a JSON schema and rendered dynamically for citizens.

## Features

### 1. Admin Service Builder (`/admin/service-builder`)
- **Visual Form Designer**: Drag-and-drop interface for building forms
- **Field Types Supported**:
  - Text input
  - Email
  - Number
  - Phone (tel)
  - Date
  - Dropdown (select)
  - Text Area
  - File Upload
  - Checkbox (single or multiple)
  - Radio buttons

- **Validation Rules**:
  - Required/Optional fields
  - Min/Max length
  - Min/Max value (numbers)
  - Pattern (regex)
  - Custom error messages

- **Field Configuration**:
  - Field name (ID)
  - Field label (display text)
  - Placeholder text
  - Options (for select/radio/checkbox)
  - Order/sequence

### 2. Dynamic Form Renderer (`DynamicFormComponent`)
- **Automatic Form Generation**: Renders forms based on JSON schema
- **Real-time Validation**: Client-side validation with error messages
- **Responsive Design**: Mobile-friendly form layout
- **Type-safe**: Angular Reactive Forms with proper typing

### 3. Citizen Application Flow
- **Step 1**: Select service
- **Step 2**: Fill out custom form (generated from service schema)
- **Step 3**: Submit application with form data

## Form Schema Structure

Each service has a `formSchema` array with field definitions:

```json
{
  "fieldName": "applicantName",
  "fieldLabel": "Applicant Full Name",
  "fieldType": "text",
  "required": true,
  "placeholder": "Enter your full name",
  "validation": {
    "minLength": 3,
    "maxLength": 100,
    "pattern": "^[a-zA-Z ]+$",
    "message": "Name must contain only letters"
  },
  "order": 1
}
```

### Field Types & Examples

#### Text Input
```json
{
  "fieldName": "fatherName",
  "fieldLabel": "Father's Name",
  "fieldType": "text",
  "required": true,
  "placeholder": "Enter father's name",
  "order": 2
}
```

#### Email
```json
{
  "fieldName": "email",
  "fieldLabel": "Email Address",
  "fieldType": "email",
  "required": true,
  "placeholder": "your.email@example.com",
  "order": 3
}
```

#### Number
```json
{
  "fieldName": "age",
  "fieldLabel": "Age",
  "fieldType": "number",
  "required": true,
  "validation": {
    "min": 18,
    "max": 100
  },
  "order": 4
}
```

#### Date
```json
{
  "fieldName": "dob",
  "fieldLabel": "Date of Birth",
  "fieldType": "date",
  "required": true,
  "order": 5
}
```

#### Dropdown
```json
{
  "fieldName": "gender",
  "fieldLabel": "Gender",
  "fieldType": "select",
  "required": true,
  "options": ["Male", "Female", "Other"],
  "order": 6
}
```

#### Text Area
```json
{
  "fieldName": "address",
  "fieldLabel": "Permanent Address",
  "fieldType": "textarea",
  "required": true,
  "placeholder": "Enter your complete address",
  "validation": {
    "minLength": 10,
    "maxLength": 500
  },
  "order": 7
}
```

#### Radio Buttons
```json
{
  "fieldName": "maritalStatus",
  "fieldLabel": "Marital Status",
  "fieldType": "radio",
  "required": true,
  "options": ["Single", "Married", "Divorced", "Widowed"],
  "order": 8
}
```

#### Checkbox (Multiple)
```json
{
  "fieldName": "documents",
  "fieldLabel": "Available Documents",
  "fieldType": "checkbox",
  "required": false,
  "options": ["Aadhar Card", "PAN Card", "Voter ID", "Passport"],
  "order": 9
}
```

#### File Upload
```json
{
  "fieldName": "photo",
  "fieldLabel": "Passport Photo",
  "fieldType": "file",
  "required": true,
  "order": 10
}
```

## Usage Guide

### For Admins: Creating a Service with Custom Form

1. **Navigate to Service Management**
   - Go to `/admin/services`
   - Click "Add New Service"

2. **Fill Basic Information**
   - Service name, description, category
   - Fee, processing time
   - Required documents list

3. **Design Application Form**
   - Click "+ Add Form Field"
   - Configure each field:
     - Set field name (unique ID)
     - Set field label (user-facing text)
     - Choose field type
     - Mark as required if needed
     - Add validation rules
     - Set display order

4. **Save Service**
   - Click "Create Service"
   - Service is now available for citizen applications

### For Citizens: Applying for Services

1. **Select Service**
   - Go to `/citizen/apply`
   - Choose service from dropdown
   - Review service details

2. **Fill Application Form**
   - Dynamic form renders based on service schema
   - Fill all required fields
   - Upload required documents
   - Real-time validation feedback

3. **Submit Application**
   - Click "Submit Application"
   - Application data stored in `applicationData` field
   - Redirected to applications list

## Database Schema

### Service Model
```javascript
{
  name: String,
  description: String,
  category: String,
  fee: Number,
  formSchema: [{
    fieldName: String,
    fieldLabel: String,
    fieldType: String, // 'text', 'email', 'number', 'date', 'select', 'textarea', 'file', 'checkbox', 'radio'
    required: Boolean,
    placeholder: String,
    options: [String],
    validation: {
      minLength: Number,
      maxLength: Number,
      min: Number,
      max: Number,
      pattern: String,
      message: String
    },
    order: Number
  }],
  requiredDocuments: [String],
  isActive: Boolean
}
```

### Application Model
```javascript
{
  applicant: ObjectId,
  service: ObjectId,
  applicationData: Object, // Dynamic form data stored here
  status: String,
  documents: [{
    name: String,
    path: String,
    uploadedAt: Date
  }]
}
```

## API Endpoints

### Services
- `GET /api/services` - Get all services (active only for citizens, all for admin)
- `GET /api/services/:id` - Get service with formSchema
- `POST /api/services` - Create service with formSchema (Admin)
- `PUT /api/services/:id` - Update service formSchema (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Applications
- `POST /api/citizen/applications` - Submit application with dynamic form data
- `GET /api/citizen/applications` - Get user's applications
- Form data is stored in `applicationData` field as JSON

## Example: PAN Card Application Form

```json
{
  "name": "PAN Card Application",
  "category": "Certificate",
  "fee": 110,
  "formSchema": [
    {
      "fieldName": "applicantName",
      "fieldLabel": "Full Name (as per Aadhar)",
      "fieldType": "text",
      "required": true,
      "placeholder": "Enter your full name",
      "validation": {
        "minLength": 3,
        "maxLength": 100
      },
      "order": 1
    },
    {
      "fieldName": "fatherName",
      "fieldLabel": "Father's Name",
      "fieldType": "text",
      "required": true,
      "order": 2
    },
    {
      "fieldName": "dob",
      "fieldLabel": "Date of Birth",
      "fieldType": "date",
      "required": true,
      "order": 3
    },
    {
      "fieldName": "gender",
      "fieldLabel": "Gender",
      "fieldType": "select",
      "required": true,
      "options": ["Male", "Female", "Transgender"],
      "order": 4
    },
    {
      "fieldName": "email",
      "fieldLabel": "Email Address",
      "fieldType": "email",
      "required": true,
      "order": 5
    },
    {
      "fieldName": "mobile",
      "fieldLabel": "Mobile Number",
      "fieldType": "tel",
      "required": true,
      "validation": {
        "pattern": "^[0-9]{10}$",
        "message": "Enter valid 10-digit mobile number"
      },
      "order": 6
    },
    {
      "fieldName": "address",
      "fieldLabel": "Permanent Address",
      "fieldType": "textarea",
      "required": true,
      "order": 7
    },
    {
      "fieldName": "aadharNumber",
      "fieldLabel": "Aadhar Number",
      "fieldType": "text",
      "required": true,
      "validation": {
        "pattern": "^[0-9]{12}$",
        "message": "Enter valid 12-digit Aadhar number"
      },
      "order": 8
    }
  ]
}
```

## Validation

### Frontend Validation (Angular)
- Required fields
- Email format
- Min/Max length
- Min/Max value
- Regex patterns
- Custom error messages

### Backend Validation
- Schema validation via Mongoose
- Service existence check
- User authentication
- Role-based access control

## Best Practices

1. **Field Naming**: Use camelCase for field names (e.g., `applicantName`, not `Applicant Name`)
2. **Order**: Set logical order values (1, 2, 3...) for proper form flow
3. **Required Fields**: Mark essential fields as required
4. **Validation Messages**: Provide clear, user-friendly error messages
5. **Field Types**: Choose appropriate types (e.g., `email` for emails, not `text`)
6. **Options**: For select/radio/checkbox, provide meaningful options
7. **Placeholders**: Add helpful placeholder text for better UX

## Future Enhancements

- [ ] Conditional fields (show/hide based on other field values)
- [ ] Field dependencies and calculations
- [ ] Rich text editor support
- [ ] Multi-step forms
- [ ] Form templates/presets
- [ ] Import/export form schemas
- [ ] Form analytics (completion rates, field errors)
- [ ] A/B testing for forms
- [ ] Auto-save draft applications
- [ ] Pre-fill from user profile

## Troubleshooting

### Form not rendering
- Check if service has `formSchema` array
- Verify `formSchema` structure matches expected format
- Check browser console for errors

### Validation not working
- Ensure `required` and `validation` properties are set correctly
- Check regex patterns are valid
- Verify min/max values are reasonable

### Submit button disabled
- Form must be valid to enable submit
- Mark fields as touched to see validation errors
- Check all required fields are filled

## Support
For issues or questions about the Dynamic Form Builder, contact the development team or refer to the main project documentation.
