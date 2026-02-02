# Where to Find Features Guide

## 🔐 Login Issues - FIXED ✅

### Problem: Office/Consultant Login Redirected Back to Login
**Solution**: Fixed redirect path from `/consultant/dashboard` → `/consultant`

### How to Login as Consultant:
1. Go to http://localhost:4200
2. Click dropdown menu → "Office Login"
3. OR directly: http://localhost:4200/consultant-login
4. Enter consultant credentials
5. ✅ Now correctly redirects to `/consultant` (Assigned Applications)

---

## 💰 Payment Management Locations

### 1. **View Payment Details** (All Roles)
**Location**: Application Detail Page

**How to Access**:
- **Citizen**: 
  - Login → My Applications → Click "View Details" on any application
  - See payment section with amount, status, method, transaction ID
  
- **Consultant**:
  - Login → Assigned Applications → Click "View Details"
  - See payment information
  - Can update payment status (if admin grants permission)
  
- **Admin**:
  - Login → All Applications → Click "View"
  - Full payment details displayed
  - Can update payment status

**Payment Info Shows**:
- Amount: ₹[amount]
- Status: Pending / Paid / Failed / Refunded
- Transaction ID (if payment processed)
- Payment Method: Cash / Online / Card / UPI
- Payment Date (when paid)

### 2. **Process Payment** (Citizen Only)
**Location**: Application Detail Page

**Steps**:
1. Login as Citizen
2. Go to "My Applications"
3. Click "View Details" on application
4. If payment status is "Pending", you'll see "Make Payment" button
5. Click "Make Payment"
6. Select payment method:
   - Cash
   - Online
   - Card
   - UPI
7. Click "Process Payment"
8. Transaction ID auto-generated
9. Status updates to "Paid"

### 3. **Update Payment Status** (Admin/Consultant)
**Location**: Application Detail Page

**Admin Steps**:
1. Login as Admin
2. Go to "All Applications"
3. Click "View" on any application
4. Scroll to payment section
5. Change status dropdown (Pending/Paid/Failed/Refunded)
6. Click "Update Payment Status"

**Consultant Steps**:
1. Login as Consultant
2. Go to "Assigned Applications"  
3. Click "View Details"
4. See payment status
5. Can add remarks about payment

### 4. **Payment API Endpoints**
```
GET    /api/payments/:applicationId        - Get payment details
PUT    /api/payments/:applicationId        - Update payment (Admin/Consultant)
POST   /api/payments/:applicationId/process - Process payment (Citizen)
```

---

## 👥 Employee Management

### Location: Admin Dashboard
**Menu Path**: Admin Login → Employee Management

**Direct URL**: http://localhost:4200/admin/employees

**Features**:
1. **View All Employees**
   - See all consultants and admins
   - View statistics (assigned/completed applications)
   
2. **Create Employee**
   - Click "Add New Employee"
   - Fill form: name, email, phone, address, password, role
   - Select role: Consultant or Admin
   - Save
   
3. **Edit Employee**
   - Click "Edit" on employee card
   - Modify details
   - Save changes
   
4. **Delete Employee**
   - Click "Delete"
   - Confirm deletion

---

## 📋 Application Detail View

### Access Points:

**Citizen**:
- My Applications → "View Details" button
- URL: `/citizen/applications/:id`

**Consultant**:
- Assigned Applications → "View Details" button
- URL: `/consultant/applications/:id`

**Admin**:
- All Applications → "View" button
- URL: `/admin/applications/:id`

### What's Shown:
1. Application Information
   - Application Number
   - Service Name
   - Citizen Details
   - Status
   - Assigned Consultant (if assigned)
   
2. **Payment Section** 💰
   - Amount
   - Status Badge
   - Transaction ID
   - Payment Method
   - Payment Date
   - "Make Payment" button (for citizens with pending payment)
   
3. Documents
   - List of uploaded documents
   - View/Download links
   
4. Remarks/Comments
   - All comments from consultant/admin
   - Add new remark (consultant/admin only)
   
5. Status Updates
   - Current status
   - Update status dropdown (consultant/admin only)

---

## 🎯 Auto-Assignment

### Location: Admin Dashboard → All Applications
**Menu Path**: Admin Login → All Applications

**How to Use**:
1. Login as Admin
2. Click "All Applications" in sidebar
3. Find unassigned application (shows "Not Assigned")
4. Click "Auto Assign" button
5. System automatically assigns to consultant with least workload
6. Application list refreshes showing assigned consultant

**Algorithm**: Round-robin based on active applications count

---

## 🔑 All Login Pages

### 1. Citizen Login
- **URL**: http://localhost:4200/login
- **Menu**: Dropdown → "Login"
- **Theme**: Blue
- **Redirects to**: `/citizen`

### 2. Consultant Login (Office)
- **URL**: http://localhost:4200/consultant-login
- **Menu**: Dropdown → "Office Login"
- **Theme**: Green
- **Redirects to**: `/consultant` ✅ FIXED

### 3. Admin Login
- **URL**: http://localhost:4200/admin-login
- **Menu**: Dropdown → "Admin Login"
- **Theme**: Red
- **Redirects to**: `/admin` ✅ FIXED

---

## 📊 Admin Menu Structure (Updated)

```
Admin Dashboard
├── Dashboard (Stats)
├── User Management (Citizens)
├── Employee Management (Consultants/Admins) ✅ NEW
├── Service Management (PAN, Passport, etc.)
├── All Applications (View, Assign, Update)
└── Logout
```

**Employee Management** is now visible in the admin sidebar!

---

## 🧪 Testing Payment Management

### Test Scenario 1: Citizen Makes Payment
```
1. Register/Login as Citizen
2. Apply for PAN Card service
3. Go to "My Applications"
4. Click "View Details"
5. See Payment Status: "Pending"
6. Click "Make Payment"
7. Select "UPI"
8. Click "Process Payment"
9. ✅ Status changes to "Paid"
10. Transaction ID displayed
```

### Test Scenario 2: Admin Updates Payment
```
1. Login as Admin
2. Click "All Applications"
3. Click "View" on any application
4. Scroll to Payment Section
5. Change status dropdown to "Refunded"
6. Click "Update Payment Status"
7. ✅ Payment status updated
```

### Test Scenario 3: View Payment Details
```
1. Login as Consultant
2. Click "Assigned Applications"
3. Click "View Details" on application
4. Scroll down to Payment Information
5. ✅ See all payment details:
   - Amount: ₹500
   - Status: Paid
   - Method: UPI
   - Transaction ID: TXN1734612345789
   - Date: Dec 19, 2025
```

---

## 🔧 Quick Access URLs

### Application Pages
- Home: http://localhost:4200
- Citizen Dashboard: http://localhost:4200/citizen
- Consultant Dashboard: http://localhost:4200/consultant
- Admin Dashboard: http://localhost:4200/admin

### Management Pages
- Employee Management: http://localhost:4200/admin/employees
- All Applications: http://localhost:4200/admin/applications
- User Management: http://localhost:4200/admin/users
- Service Management: http://localhost:4200/admin/services

### Login Pages
- Citizen: http://localhost:4200/login
- Consultant: http://localhost:4200/consultant-login
- Admin: http://localhost:4200/admin-login

---

## ✅ Fixes Applied

1. ✅ **Consultant Login Redirect** - Fixed from `/consultant/dashboard` to `/consultant`
2. ✅ **Admin Login Redirect** - Fixed from `/admin/dashboard` to `/admin`
3. ✅ **Employee Management Menu** - Added to admin sidebar
4. ✅ **Payment Management** - Available in all application detail views

**All issues resolved!** 🎉

---

## 📝 Summary

### Payment Management is in:
1. **Application Detail Page** - All roles can view
2. **Citizen can process payment** - "Make Payment" button
3. **Admin can update status** - Payment status dropdown
4. **API endpoints available** - `/api/payments/*`

### Employee Management is in:
1. **Admin Sidebar** - "Employee Management" menu item
2. **Direct URL** - `/admin/employees`
3. **Full CRUD** - Create, Read, Update, Delete employees

### Login Issues:
- ✅ Consultant login now works correctly
- ✅ Admin login now works correctly
- ✅ All redirects fixed
