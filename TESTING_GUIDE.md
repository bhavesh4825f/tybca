# Testing Guide for New Features

## Servers Running
- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:4200 ✅

## Features Implemented

### 1. Application Detail View & Payment System
**How to Test:**

1. **Register as Citizen** (if not already registered)
   - Go to http://localhost:4200
   - Click "Register" 
   - Fill in details (role is auto-set to "citizen")
   - Submit

2. **Login as Citizen**
   - Click "Login" from dropdown menu
   - Enter credentials
   - You'll be redirected to citizen dashboard

3. **Apply for a Service**
   - Go to "Apply for Service"
   - Select a service (e.g., PAN Card)
   - Fill the form
   - Submit

4. **View Application Details**
   - Go to "My Applications"
   - Click "View Details" button on any application
   - You should see:
     - Application information
     - Payment section showing status, amount, method
     - Documents uploaded
     - Remarks/comments
     - Status updates

5. **Make Payment**
   - On the detail page, if payment status is "Pending"
   - Click "Make Payment" button
   - Select payment method (Cash/Online/Card/UPI)
   - Click "Process Payment"
   - Payment status should update to "Paid"

---

### 2. Auto-Assignment Feature
**How to Test:**

1. **Login as Admin**
   - Go to http://localhost:4200
   - Click dropdown menu → "Admin Login"
   - Enter admin credentials
   - Redirected to admin dashboard

2. **Create Consultant Employee** (if needed)
   - Go to "Employee Management"
   - Click "Add New Employee"
   - Fill details:
     - Name, Email, Phone, Address
     - Role: Select "consultant"
     - Password
   - Click "Save"

3. **Auto-Assign Application**
   - Go to "All Applications"
   - Find an unassigned application (shows "Not Assigned")
   - Click "Auto Assign" button
   - System automatically assigns to consultant with least workload
   - Application now shows consultant name in "Assigned To" column

---

### 3. Separate Login Panels
**How to Test:**

1. **Admin Login**
   - URL: http://localhost:4200/admin-login
   - Or use dropdown → "Admin Login"
   - Red themed login page
   - Only admin role can access
   - Non-admin users get "Access denied" message

2. **Consultant Login**
   - URL: http://localhost:4200/consultant-login
   - Or use dropdown → "Office Login"
   - Green themed login page
   - Only consultant role can access
   - Non-consultant users get "Access denied" message

3. **Citizen Login**
   - URL: http://localhost:4200/login
   - Or use dropdown → "Login"
   - Default login for citizens
   - Blue themed

---

### 4. Registration Restricted to Citizens
**How to Test:**

1. Go to http://localhost:4200/register
2. Check the form - there should be NO role selection dropdown
3. Role is automatically set to "citizen" (hidden field)
4. Register a new user
5. Verify in database or admin panel that role is "citizen"

---

### 5. Employee Management Panel
**How to Test:**

1. **Login as Admin**
2. **Navigate to "Employee Management"**
3. **View Employees**
   - See list of all consultants and admins
   - Each card shows:
     - Name, email, phone, address
     - Role badge (Consultant/Admin)
     - Statistics (assigned/completed applications)

4. **Create Employee**
   - Click "Add New Employee"
   - Fill all fields
   - Select role (consultant/admin)
   - Submit
   - New employee appears in list

5. **Edit Employee**
   - Click "Edit" on any employee card
   - Modify details
   - Save
   - Changes reflected

6. **Delete Employee**
   - Click "Delete"
   - Confirm deletion
   - Employee removed from list

---

## Complete Workflow Test

### Scenario: PAN Card Application with Payment

1. **Citizen Journey**
   - Register → Login
   - Apply for PAN Card service
   - Upload documents
   - View application detail
   - See payment status: "Pending"
   - Make payment with UPI
   - Payment status changes to "Paid"

2. **Admin Journey**
   - Login via admin panel
   - Create consultant employee
   - Go to "All Applications"
   - Find unassigned PAN application
   - Click "Auto Assign"
   - System assigns to consultant

3. **Consultant Journey**
   - Login via consultant panel
   - See assigned application in "My Assigned Applications"
   - Click "View Details"
   - Review application and documents
   - Add remarks/comments
   - Update status to "Under Review" or "Approved"

4. **Back to Citizen**
   - Citizen refreshes their application detail page
   - Sees updated status
   - Sees consultant remarks
   - Tracks application progress

---

## API Endpoints Available

### Payment APIs
- `GET /api/payments/:applicationId` - Get payment details
- `PUT /api/payments/:applicationId` - Update payment (Admin/Consultant)
- `POST /api/payments/:applicationId/process` - Process payment (Citizen)

### Auto-Assignment API
- `POST /api/admin/applications/:id/auto-assign` - Auto assign application

### Employee Management APIs
- `GET /api/admin/users?role=consultant` - Get all consultants
- `POST /api/admin/users` - Create employee
- `PUT /api/admin/users/:id` - Update employee
- `DELETE /api/admin/users/:id` - Delete employee

---

## Troubleshooting

### Payment not processing
- Check browser console for errors
- Verify backend is running on port 5000
- Check MongoDB connection
- Ensure application has payment object in database

### Auto-assign not working
- Ensure at least one consultant employee exists
- Check consultant role is set correctly
- Verify admin authentication
- Check browser console for API errors

### Can't see detail view
- Check if "View Details" links appear on application lists
- Verify routing is configured for `/citizen/applications/:id`
- Clear browser cache and reload
- Check browser console for navigation errors

### Login panels redirecting incorrectly
- Verify user role in database
- Check JWT token in cookies
- Clear cookies and login again
- Ensure role validation logic is working

---

## Default Admin Credentials
If you need to create an admin user via MongoDB:
```javascript
use government_services_db
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash
  role: "admin",
  phone: "1234567890",
  createdAt: new Date()
})
```

---

## Notes
- All features are now live and functional
- Payment gateway integration is planned for future (currently mock payment)
- Email/SMS notifications can be added later
- Application detail view works for all three roles (citizen, consultant, admin)
- Auto-assignment uses round-robin algorithm based on active workload
