# Application Workflow Diagram

## Complete Application Lifecycle with Editing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CITIZEN APPLICATION SUBMISSION                           │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Citizen Applies
├─ Selects service
├─ Fills form with data
├─ Uploads required documents
└─ Submits application
   │
   ├─ Status: "Submitted"
   ├─ Payment Status: "Pending"
   ├─ Auto-assigned to consultant
   └─ Application saved to database


Step 2: Admin/Consultant Reviews
├─ Opens application detail
├─ Views all submitted data
├─ Checks documents
└─ Reviews payment status


┌─────────────────────────────────────────────────────────────────────────────┐
│                    DECISION POINT: Modifications Needed?                    │
└─────────────────────────────────────────────────────────────────────────────┘

                            │
                ┌───────────┴───────────┐
                │                       │
           NO CHANGES            CHANGES NEEDED
           (APPROVE FLOW)        (EDITING FLOW)
                │                       │
                │                       ▼
                │              
                │        ┌────────────────────────────────────┐
                │        │  Admin/Consultant Action           │
                │        ├────────────────────────────────────┤
                │        │ 1. Clicks "Enable Form Editing"    │
                │        │ 2. Enters reason (required)        │
                │        │ 3. System saves current version    │
                │        │ 4. Sets editingEnabled = true      │
                │        │ 5. Records enabledBy & enabledAt   │
                │        └────────────────────────────────────┘
                │                       │
                │                       ▼
                │        ┌────────────────────────────────────┐
                │        │   Citizen Receives Notification    │
                │        ├────────────────────────────────────┤
                │        │ • Green banner appears             │
                │        │ • Shows admin's reason message     │
                │        │ • "Edit My Application" button     │
                │        └────────────────────────────────────┘
                │                       │
                │                       ▼
                │        ┌────────────────────────────────────┐
                │        │   Citizen Edits Application        │
                │        ├────────────────────────────────────┤
                │        │ 1. Clicks "Edit My Application"    │
                │        │ 2. Modifies form fields            │
                │        │ 3. Updates documents               │
                │        │ 4. Saves changes (optional)        │
                │        │ 5. Submits edited form             │
                │        │ 6. lastEditedAt timestamp recorded │
                │        └────────────────────────────────────┘
                │                       │
                │                       ▼
                │        ┌────────────────────────────────────┐
                │        │   Form Resubmitted                 │
                │        ├────────────────────────────────────┤
                │        │ • Status: "Submitted"              │
                │        │ • editingEnabled = false           │
                │        │ • Payment status: unchanged        │
                │        │ • Previous version backed up       │
                │        │ • Ready for re-review              │
                │        └────────────────────────────────────┘
                │                       │
                │                       ▼
                │        ┌────────────────────────────────────┐
                │        │   Back to Review Cycle             │
                │        │   (Can repeat editing if needed)   │
                │        └────────────────────────────────────┘
                │                       │
                │                       │
                ▼                       ▼

    ┌──────────────────────┐  ┌──────────────────────┐
    │ APPROVED FLOW        │  │ FINAL APPROVAL       │
    │                      │  │                      │
    │ • Status: Approved   │  │ • Status: Approved   │
    │ • Upload final doc   │  │ • Upload final doc   │
    │ • Payment required   │  │ • Payment required   │
    │ • Proceed to next    │  │ • Proceed to next    │
    │   step               │  │   step               │
    └──────────────────────┘  └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ COMPLETED            │
    │                      │
    │ • Status: Completed  │
    │ • Final document     │
    │   uploaded           │
    │ • Citizen downloads  │
    │   result             │
    └──────────────────────┘
```

---

## Database Version Tracking

```
Application Document Structure
│
├─ Basic Info
│  ├─ applicationNumber: "APP..."
│  ├─ citizen: ObjectId
│  ├─ service: ObjectId
│  └─ status: "Submitted"
│
├─ Form Data
│  └─ applicationData: { ... form fields ... }
│
├─ Documents
│  ├─ documentType: "Passport"
│  ├─ documentPath: "uploads/..."
│  └─ uploadedAt: Date
│
├─ Payment (from existing system)
│  ├─ amount: 500
│  ├─ status: "Pending" | "Paid"
│  ├─ transactionId: "TXN..."
│  └─ paidAt: Date
│
├─ 🆕 Editing Information
│  ├─ editingEnabled: true/false
│  ├─ editingReason: "Please provide additional documents..."
│  ├─ enabledBy: ObjectId (reference to admin/consultant)
│  ├─ enabledAt: Date
│  ├─ lastEditedAt: Date
│  │
│  └─ previousVersions: [  ◄─── VERSION HISTORY
│      {
│        applicationData: { old form data },
│        documents: [ old document list ],
│        savedAt: Date,
│        savedBy: ObjectId
│      },
│      {
│        applicationData: { previous data },
│        documents: [ previous documents ],
│        savedAt: Date,
│        savedBy: ObjectId
│      }
│    ]
│
└─ Remarks (from existing system)
   └─ comment from admin/consultant
```

---

## API Flow Diagram

```
CITIZEN INTERACTION FLOW
═══════════════════════════════════════════════════════════════════

Step 1: Check if editing enabled
  GET /api/citizen/applications/:id
  Response includes: editingEnabled, editingReason
  
  If editingEnabled = true:
    ▼
  Show "Edit My Application" button
    │
    └─▶ Click button ─▶ Navigate to /citizen/edit-application/:id


Step 2: Load application for editing
  GET /api/applications/:id
  Response includes: applicationData, documents, editingReason
    │
    ├─▶ Display form fields from applicationData
    ├─▶ Display current documents
    └─▶ Display admin's reason message


Step 3: Save form changes (optional)
  PUT /api/applications/:id/edit-form
  Request Body:
  {
    applicationData: { updated form fields },
    documents: [ updated documents list ]
  }
  Response: Updated application with lastEditedAt timestamp


Step 4: Submit edited form (final)
  PUT /api/applications/:id/submit-edited
  Request Body: {} (empty)
  
  Validation:
  ✓ editingEnabled must be true
  ✓ All required documents must be uploaded
  ✓ Citizen must be the applicant
  
  On Success:
  ✓ editingEnabled = false (automatically)
  ✓ status = "Submitted"
  ✓ previousVersions updated with backup
  ✓ Navigate back to applications list


───────────────────────────────────────────────────────────────────

ADMIN/CONSULTANT INTERACTION FLOW
═══════════════════════════════════════════════════════════════════

Step 1: Review application
  GET /api/applications/:id
  Display all application details


Step 2: Enable editing (if changes needed)
  PUT /api/applications/:id/enable-editing
  Request Body:
  {
    reason: "Please provide scanned copy of passport"
  }
  
  On Success:
  ✓ editingEnabled = true
  ✓ editingReason = "Please provide..."
  ✓ enabledBy = current admin/consultant ID
  ✓ enabledAt = current timestamp
  ✓ Current applicationData backed up to previousVersions
  ✓ Citizen notified (via UI)


Step 3: Disable editing (if satisfied)
  PUT /api/applications/:id/disable-editing
  Request Body: {} (empty)
  
  On Success:
  ✓ editingEnabled = false
  ✓ Citizen no longer can edit


Step 4: View edit history
  GET /api/applications/:id/versions
  Response:
  [
    {
      applicationData: { ... },
      documents: [ ... ],
      savedAt: "2025-01-15T10:30:00Z",
      savedBy: { ObjectId with name/email }
    },
    ...
  ]
```

---

## User Interface Workflow

```
CITIZEN EXPERIENCE
══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────┐
│        My Applications                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Application #APP123 - Service: Passport     │   │
│  │ Status: Submitted [Blue Badge]              │   │
│  │ Payment: Pending [Red Badge]                │   │
│  │ Last Updated: 2025-01-15                    │   │
│  │ [View Details]                              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
          │ Click "View Details"
          ▼

┌─────────────────────────────────────────────────────┐
│        Application Details                          │
│                                                     │
│ ✓ GREEN BANNER (if editingEnabled = true)          │
│ ┌─────────────────────────────────────────────┐   │
│ │ ✎ Your Form is Open for Editing             │   │
│ │                                              │   │
│ │ Admin's Message:                             │   │
│ │ "Please provide additional documents"        │   │
│ │                                              │   │
│ │ [✎ Edit My Application] ◄── NEW BUTTON      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Application Info                                   │
│ ├─ Number: APP1234567890001                       │
│ ├─ Service: Passport Processing                   │
│ ├─ Status: Submitted                              │
│ ├─ Payment: Pending - Make Payment Button         │
│ └─ Assigned To: John Smith (Consultant)           │
│                                                     │
│ Documents Uploaded                                │
│ ├─ Passport: ✓ Uploaded                           │
│ ├─ Address Proof: ✓ Uploaded                      │
│ └─ Photo: [View]                                  │
│                                                     │
│ [Back to List]                                     │
└─────────────────────────────────────────────────────┘
          │ Click "Edit My Application"
          ▼

┌─────────────────────────────────────────────────────┐
│        Edit Application                             │
│                                                     │
│ BLUE BANNER - Why Editing Enabled                  │
│ ┌─────────────────────────────────────────────┐   │
│ │ ✎ Form Editing Enabled                      │   │
│ │ Reason: Please provide additional documents │   │
│ │ Enabled on: 2025-01-15 10:30 AM             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Application Info (Read-only)                       │
│ ├─ Number: APP1234567890001                       │
│ ├─ Service: Passport Processing                   │
│ ├─ Status: Submitted                              │
│ └─ Last Edited: 2025-01-15 12:00 PM               │
│                                                     │
│ Edit Form Data                                     │
│ ├─ Full Name: [John Doe] ◄── CAN EDIT             │
│ ├─ Email: [john@email.com] ◄── CAN EDIT           │
│ ├─ Phone: [9876543210] ◄── CAN EDIT               │
│ ├─ Address: [Update Address] ◄── CAN EDIT         │
│ └─ Additional Info: [Textarea...] ◄── CAN EDIT    │
│                                                     │
│ [Save Changes] ◄── OPTIONAL                        │
│                                                     │
│ Required Documents                                 │
│ ├─ Passport:                                       │
│ │  ├─ Current: passport.pdf [View]                │
│ │  └─ [Choose New File] [Upload]                  │
│ ├─ Address Proof:                                  │
│ │  ├─ Current: address.pdf [View]                 │
│ │  └─ [Choose New File] [Upload]                  │
│ └─ Photo:                                          │
│    ├─ Current: photo.jpg [View]                   │
│    └─ [Choose New File] [Upload]                  │
│                                                     │
│ [✓ Submit Edited Form] ◄── FINAL SUBMISSION       │
│ [Cancel] ◄── ABANDON EDITING                      │
└─────────────────────────────────────────────────────┘

After Submit:
  ▼
  Form disappears, redirects to My Applications
  Status still "Submitted" (ready for review)
  Payment status: Unchanged (no new payment)
  Admin notified: Updated submission available


ADMIN EXPERIENCE
════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────┐
│        Application Details (Admin View)              │
│                                                      │
│ Enable/Disable Editing (NEW SECTION)               │
│ ┌────────────────────────────────────────────────┐ │
│ │ Form Editing Control                           │ │
│ │                                                 │ │
│ │ Status: Form editing is currently DISABLED    │ │
│ │                                                 │ │
│ │ Reason for enabling: ___________________       │ │
│ │ (e.g., "Please provide additional docs")      │ │
│ │                                                 │ │
│ │ [✎ Enable Form Editing] ◄── BUTTON            │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Application Details...                              │
│ Citizen Info...                                      │
│ Payment Info...                                      │
│                                                      │
└──────────────────────────────────────────────────────┘

After clicking "Enable Form Editing":
  ▼

┌──────────────────────────────────────────────────────┐
│        Application Details (Admin View)              │
│                                                      │
│ Enable/Disable Editing (UPDATED SECTION)            │
│ ┌────────────────────────────────────────────────┐ │
│ │ Form Editing Control                           │ │
│ │                                                 │ │
│ │ 🟦 BLUE BANNER                                  │ │
│ │ Status: Form editing is currently ENABLED     │ │
│ │ Reason: "Please provide additional documents" │ │
│ │ Enabled by: Admin Name                         │ │
│ │ Enabled on: 2025-01-15 10:30 AM                │ │
│ │                                                 │ │
│ │ [× Disable Editing] ◄── BUTTON                 │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Citizen Editing Notification                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ 🟩 GREEN BANNER (What citizen sees)             │ │
│ │ ✎ Your Form is Open for Editing                │ │
│ │ Reason: "Please provide additional documents" │ │
│ │ [✎ Edit My Application]                        │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## State Transitions

```
Application Status State Machine (with editing)
════════════════════════════════════════════════════

              ┌─────────────────┐
              │   Initially Not │
              │   Submitted     │
              └────────┬────────┘
                       │
                       │ Submit Application
                       ▼
              ┌─────────────────┐
              │   Submitted     │◄───────────────────┐
              │ (editingEnabled │                    │
              │    = false)     │                    │
              └────────┬────────┘                    │
                       │                            │
    ┌──────────────────┴──────────────────┐        │
    │                                     │        │
    │ Admin enables editing               │        │
    │ (editingReason set)                 │        │
    │ (enabledAt timestamp set)           │        │
    ▼                                     │        │
┌─────────────────────────────────────┐  │        │
│ Submitted & Editing Enabled         │  │        │
│ (editingEnabled = true)             │  │        │
│ (previousVersions backed up)        │  │        │
└──┬──────────────────────────────────┘  │        │
   │                                     │        │
   │ Citizen edits and submits           │        │
   │ (form data updated)                 │        │
   │ (lastEditedAt timestamp set)        │        │
   │ (editingEnabled = false auto)       │        │
   └─────────────────────────────────────┼────────┘
                                         │
                                    Back to Submitted
                                  (Ready for re-review)
                                         │
                                         └──────┐
                                                │
                        May require more edits  │
                        (Repeat flow)           │
                                                │
    ┌───────────────────────────────────┬───────┘
    │                                   │
    │ Admin reviews and approves        │
    │                                   │
    ▼                                   ▼
┌──────────────┐            ┌──────────────────┐
│  Approved    │     OR     │ Rejected/Pending │
│              │            │    Documents     │
└──────────────┘            └──────────────────┘
       │                            │
       │ Upload final document      │ May re-open again
       │                            │
       ▼                            ▼
┌──────────────┐            ┌──────────────────┐
│  Completed   │            │   (Edit cycle)   │
│              │            │   repeats...     │
└──────────────┘            └──────────────────┘
```

---

## Key Flags Explanation

```
Application Editing Flags
═════════════════════════════════════════════════════════

┌────────────────────────────────────────────────┐
│ editingEnabled (Boolean)                       │
├────────────────────────────────────────────────┤
│ true  = Citizen can currently edit the form   │
│ false = Citizen CANNOT edit the form          │
│                                               │
│ Set by: Admin/Consultant PUT request          │
│ Unset by: Citizen's form submission           │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ editingReason (String)                         │
├────────────────────────────────────────────────┤
│ Example: "Please provide passport scan"       │
│                                               │
│ Displayed to: Citizen (in green banner)       │
│ Set when: Admin enables editing               │
│ Cleared when: Admin disables editing          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ enabledBy (ObjectId Reference)                 │
├────────────────────────────────────────────────┤
│ Stores: ID of admin/consultant who enabled   │
│ Used for: Audit trail, accountability         │
│ Set when: Admin enables editing               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ enabledAt (Date Timestamp)                     │
├────────────────────────────────────────────────┤
│ Records: When editing was enabled             │
│ Used for: Audit trail, time tracking          │
│ Set when: Admin enables editing               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ lastEditedAt (Date Timestamp)                  │
├────────────────────────────────────────────────┤
│ Records: When citizen last edited form        │
│ Used for: Tracking editing activity           │
│ Updated: Every form save by citizen           │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ previousVersions (Array)                       │
├────────────────────────────────────────────────┤
│ Stores: Complete snapshots of form data       │
│ When: Before each editing session enabled     │
│ Contains: applicationData, documents,         │
│           savedAt timestamp, savedBy user ID  │
│ Used for: Version history, rollback reference│
└────────────────────────────────────────────────┘
```

---

## Payment Status During Editing

```
Payment Persistence Through Editing Cycle
══════════════════════════════════════════════════════

Initial Submission:
  ├─ Payment Status: "Pending"
  └─ Amount: ₹500 (from service.fee)

┌─ Enable Editing
│  ├─ Payment Status: "Pending" (UNCHANGED)
│  ├─ Amount: ₹500 (UNCHANGED)
│  └─ NO re-payment dialog shown
│
├─ Citizen Edits & Resubmits
│  ├─ Payment Status: "Pending" (UNCHANGED)
│  ├─ Amount: ₹500 (UNCHANGED)
│  └─ NO new payment required
│
└─ If More Edits Needed
   ├─ Enable Editing Again
   ├─ Payment Status: "Pending" (UNCHANGED)
   ├─ Amount: ₹500 (UNCHANGED)
   └─ NO new payment required


ONLY when Citizen processes payment:
  payment.status = "Paid"
  payment.paidAt = current timestamp
  payment.transactionId = "TXN..."
```

This ensures applicants aren't charged multiple times for the same service!
