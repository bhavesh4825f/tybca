import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <h2>Application Details</h2>
        <button class="btn-back" routerLink="..">← Back</button>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading && application" class="detail-content">
        <!-- Application Info -->
        <div class="info-card">
          <h3>Application Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Application Number:</label>
              <span class="value">{{ application.applicationNumber }}</span>
            </div>
            <div class="info-item">
              <label>Service:</label>
              <span class="value">{{ application.service?.name }}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              <span class="badge" [class]="'status-' + application.status.toLowerCase().replace(' ', '-')">
                {{ application.status }}
              </span>
            </div>
            <div class="info-item">
              <label>Submitted At:</label>
              <span class="value">{{ application.submittedAt | date:'medium' }}</span>
            </div>
            <div class="info-item" *ngIf="application.assignedTo">
              <label>Assigned To:</label>
              <span class="value">{{ application.assignedTo?.name }}</span>
            </div>
            <div class="info-item" *ngIf="application.completedAt">
              <label>Completed At:</label>
              <span class="value">{{ application.completedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <!-- Reassign Employee (Admin Only) -->
        <div class="info-card" *ngIf="currentUser?.role === 'admin'">
          <h3>Reassign Employee</h3>
          <div class="reassign-section">
            <div class="form-group">
              <label>Select Employee:</label>
              <select [(ngModel)]="selectedEmployeeId" class="form-control">
                <option value="">-- Select Employee --</option>
                <option *ngFor="let emp of employees" [value]="emp._id">
                  {{ emp.name }} ({{ emp.email }})
                </option>
              </select>
            </div>
            <button 
              class="btn btn-primary" 
              (click)="reassignEmployee()"
              [disabled]="!selectedEmployeeId || reassigning">
              {{ reassigning ? 'Reassigning...' : 'Reassign Application' }}
            </button>
          </div>
        </div>

        <!-- Citizen Info (For Admin/Employee) -->
        <div class="info-card" *ngIf="application.citizen && currentUser?.role !== 'citizen'">
          <h3>Citizen Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span class="value">{{ application.citizen?.name }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span class="value">{{ application.citizen?.email }}</span>
            </div>
            <div class="info-item">
              <label>Phone:</label>
              <span class="value">{{ application.citizen?.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Application Data -->
        <div class="info-card" *ngIf="application.applicationData">
          <h3>Application Form Data</h3>
          <div class="info-grid">
            <div class="info-item" *ngFor="let key of objectKeys(application.applicationData)">
              <label>{{ formatLabel(key) }}:</label>
              <span class="value">{{ application.applicationData[key] }}</span>
            </div>
          </div>
        </div>

        <!-- Required Documents -->
        <div class="info-card" *ngIf="application.service?.requiredDocuments && application.service.requiredDocuments.length > 0">
          <h3>📋 Required Documents</h3>
          <p class="section-description">The following documents must be submitted for this service:</p>
          <div class="required-docs-list">
            <div class="required-doc-item" *ngFor="let docType of application.service.requiredDocuments; let i = index">
              <div class="doc-number">{{ i + 1 }}</div>
              <div class="doc-name">{{ docType }}</div>
              <div class="doc-status-indicator">
                <span *ngIf="isDocumentUploaded(docType)" class="uploaded-badge">✓ Uploaded</span>
                <span *ngIf="!isDocumentUploaded(docType)" class="pending-badge">⚠ Pending</span>
              </div>
            </div>
          </div>
          
          <!-- Upload Document Section (Citizen Only) -->
          <div class="upload-doc-section" *ngIf="currentUser?.role === 'citizen' && canUploadDocuments()">
            <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Upload Documents</h4>
            <div class="form-group">
              <label>Select Document Type:</label>
              <select [(ngModel)]="uploadDocType" class="form-control">
                <option value="">-- Select Document Type --</option>
                <option *ngFor="let docType of application.service.requiredDocuments" [value]="docType">
                  {{ docType }}
                </option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group" *ngIf="uploadDocType === 'Other'">
              <label>Specify Document Name:</label>
              <input type="text" [(ngModel)]="customDocType" placeholder="Enter document name" class="form-control">
            </div>
            <div class="form-group">
              <label>Choose File:</label>
              <input type="file" (change)="onFileSelect($event)" accept=".pdf,.jpg,.jpeg,.png" class="file-input">
              <small class="file-note">Accepted formats: PDF, JPG, PNG (Max 5MB)</small>
            </div>
            <div *ngIf="selectedFile" class="selected-file">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ selectedFile.name }}</span>
              <button class="btn-remove" (click)="removeFile()">✕</button>
            </div>
            <button class="btn-upload" (click)="uploadDocument()" [disabled]="!canUpload() || uploading">
              {{ uploading ? 'Uploading...' : 'Upload Document' }}
            </button>
          </div>

          <!-- Upload Restricted Message -->
          <div class="upload-restricted-message" *ngIf="currentUser?.role === 'citizen' && !canUploadDocuments() && application.status !== 'Completed'">
            <div class="alert alert-warning">
              <h4>⚠ Document Upload Restricted</h4>
              <p>Your application is currently <strong>{{ application.status }}</strong>. Document uploads are not allowed at this stage.</p>
              <p *ngIf="application.status === 'Under Review'">
                Your application is being reviewed by our team. If additional documents are required, the administrator will enable editing for you.
              </p>
            </div>
          </div>
        </div>

        <!-- Submitted Documents -->
        <div class="info-card" *ngIf="application.documents && application.documents.length > 0">
          <h3>Submitted Documents</h3>
          <div class="documents-list">
            <div class="document-item" *ngFor="let doc of application.documents; let i = index">
              <div class="document-info">
                <div class="document-icon">📄</div>
                <div class="document-details">
                  <h4>{{ doc.documentType }}</h4>
                  <p class="document-status" *ngIf="doc.documentPath">
                    ✓ Uploaded on {{ doc.uploadedAt | date:'medium' }}
                  </p>
                  <p class="document-status pending" *ngIf="!doc.documentPath">
                    ⚠ Not uploaded yet
                  </p>
                </div>
              </div>
              <div class="document-actions">
                <button *ngIf="doc.documentPath" 
                        (click)="viewDocument(doc.documentPath, doc.documentType)"
                        class="btn-view-doc">
                  View Document
                </button>
                <a *ngIf="doc.documentPath" 
                   [href]="environment.baseUrl + '/' + doc.documentPath" 
                   download
                   class="btn-download-doc">
                  Download
                </a>
                <span *ngIf="!doc.documentPath" class="no-document">No file uploaded</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="info-card">
          <h3>Payment Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Amount:</label>
              <span class="value">₹{{ application.payment?.amount || application.service?.fee || 0 }}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              <span class="badge" [class]="'payment-' + (application.payment?.status || 'pending').toLowerCase()">
                {{ application.payment?.status || 'Pending' }}
              </span>
            </div>
            <div class="info-item" *ngIf="application.payment?.transactionId">
              <label>Transaction ID:</label>
              <span class="value">{{ application.payment.transactionId }}</span>
            </div>
            <div class="info-item" *ngIf="application.payment?.paymentMethod">
              <label>Payment Method:</label>
              <span class="value">{{ application.payment.paymentMethod }}</span>
            </div>
            <div class="info-item" *ngIf="application.payment?.paidAt">
              <label>Paid At:</label>
              <span class="value">{{ application.payment.paidAt | date:'medium' }}</span>
            </div>
          </div>
          
          <!-- Payment Actions -->
          <div class="payment-actions" *ngIf="currentUser?.role === 'citizen' && (!application.payment || application.payment?.status === 'Pending')">
            <button class="btn-pay" (click)="showPaymentForm = true">Make Payment</button>
          </div>

          <!-- Payment Form -->
          <div class="payment-form" *ngIf="showPaymentForm">
            <h4>Select Payment Method</h4>
            <p class="payment-note">Choose your preferred payment method to complete the transaction</p>
            <div class="payment-methods">
              <div class="payment-option" 
                   [class.selected]="paymentData.paymentMethod === 'UPI'"
                   (click)="paymentData.paymentMethod = 'UPI'">
                <div class="payment-icon">📱</div>
                <div class="payment-label">UPI</div>
              </div>
              <div class="payment-option" 
                   [class.selected]="paymentData.paymentMethod === 'Card'"
                   (click)="paymentData.paymentMethod = 'Card'">
                <div class="payment-icon">💳</div>
                <div class="payment-label">Debit/Credit Card</div>
              </div>
              <div class="payment-option" 
                   [class.selected]="paymentData.paymentMethod === 'Cash'"
                   (click)="paymentData.paymentMethod = 'Cash'">
                <div class="payment-icon">💵</div>
                <div class="payment-label">Cash</div>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-submit" (click)="processPayment()" [disabled]="!paymentData.paymentMethod">Proceed to Pay</button>
              <button class="btn-cancel" (click)="showPaymentForm = false">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Remarks/Comments -->
        <div class="info-card">
          <h3>Remarks</h3>
          <div class="remarks-list" *ngIf="application.remarks && application.remarks.length > 0">
            <div class="remark-item" *ngFor="let remark of application.remarks">
              <div class="remark-meta">
                <strong>{{ remark.by?.name }}</strong>
                <span class="timestamp">{{ remark.timestamp | date:'short' }}</span>
              </div>
              <p>{{ remark.comment }}</p>
            </div>
          </div>
          <p *ngIf="!application.remarks || application.remarks.length === 0" class="no-data">
            No remarks yet
          </p>
          
          <!-- Add Remark (For Employee/Admin) -->
          <div class="add-remark" *ngIf="currentUser?.role !== 'citizen'">
            <textarea [(ngModel)]="newRemark" placeholder="Add a remark..." rows="3"></textarea>
            <button class="btn-add" (click)="addRemark()">Add Remark</button>
          </div>
        </div>

        <!-- Completed Document Upload (Employee/Admin Only) -->
        <div class="info-card" *ngIf="(currentUser?.role === 'employee' || currentUser?.role === 'admin') && application.status === 'Completed'">
          <h3>Upload Final Document</h3>
          <div class="upload-section" *ngIf="!application.completedDocument?.documentPath">
            <p>Upload the completed document for the citizen to download</p>
            <div class="form-group">
              <label>Choose File:</label>
              <input type="file" (change)="onCompletedFileSelect($event)" accept=".pdf,.jpg,.jpeg,.png" class="file-input">
              <small class="file-note">Accepted formats: PDF, JPG, PNG (Max 10MB)</small>
            </div>
            <div *ngIf="completedDocFile" class="selected-file">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ completedDocFile.name }}</span>
              <button class="btn-remove" (click)="removeCompletedFile()">✕</button>
            </div>
            <button class="btn-upload" (click)="uploadCompletedDocument()" [disabled]="!completedDocFile || uploadingCompleted">
              {{ uploadingCompleted ? 'Uploading...' : 'Upload Completed Document' }}
            </button>
          </div>
          <div *ngIf="application.completedDocument?.documentPath" class="completed-doc-info">
            <div class="success-message">✓ Completed document uploaded successfully</div>
            <p>Uploaded on: {{ application.completedDocument.uploadedAt | date:'medium' }}</p>
            <button (click)="viewDocument(application.completedDocument.documentPath, 'Completed Document')" class="btn-view">View Document</button>
            <a [href]="environment.baseUrl + '/' + application.completedDocument.documentPath" download class="btn-download">Download</a>
          </div>
        </div>

        <!-- Download Completed Document (Citizen Only) -->
        <div class="info-card" *ngIf="currentUser?.role === 'citizen' && application.status === 'Completed' && application.completedDocument?.documentPath">
          <h3>✓ Your Document is Ready!</h3>
          <div class="download-section">
            <p class="success-message">Your application has been completed. Download your document below:</p>
            <a [href]="environment.baseUrl + '/' + application.completedDocument.documentPath" 
               download 
               class="btn-download">
              📥 Download Document
            </a>
            <p class="uploaded-info">Uploaded on: {{ application.completedDocument.uploadedAt | date:'medium' }}</p>
          </div>
        </div>

        <!-- Enable/Disable Editing (Admin/Consultant) -->
        <div class="info-card" *ngIf="currentUser?.role !== 'citizen'">
          <h3>Form Editing Control</h3>
          <div *ngIf="application.editingEnabled" class="editing-enabled-section">
            <div class="alert-info-edit">
              <p><strong>Status:</strong> Form editing is currently ENABLED for this applicant</p>
              <p *ngIf="application.editingReason"><strong>Reason:</strong> {{ application.editingReason }}</p>
              <p *ngIf="application.enabledAt">
                <strong>Enabled on:</strong> {{ application.enabledAt | date:'medium' }}
              </p>
            </div>
            <div class="edit-controls">
              <input 
                type="text" 
                placeholder="Enter reason for disabling (optional)"
                [(ngModel)]="disableEditingReason"
                class="form-control" />
              <button 
                class="btn btn-danger"
                (click)="disableEditing()"
                [disabled]="disablingEditing">
                {{ disablingEditing ? 'Disabling...' : '× Disable Editing' }}
              </button>
            </div>
          </div>
          
          <div *ngIf="!application.editingEnabled" class="editing-disabled-section">
            <p><strong>Status:</strong> Form editing is currently DISABLED</p>
            <div class="edit-controls">
              <textarea 
                placeholder="Reason for enabling editing (e.g., 'Please provide additional documents', 'Please correct the following information...')"
                [(ngModel)]="editingReason"
                class="form-control edit-reason"></textarea>
              <button 
                class="btn btn-success"
                (click)="enableEditing()"
                [disabled]="!editingReason.trim() || enablingEditing">
                {{ enablingEditing ? 'Enabling...' : '✎ Enable Form Editing' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Citizen Editing Section - Inline Editing -->
        <div *ngIf="currentUser?.role === 'citizen' && application.editingEnabled">
          <!-- Editing Enabled Banner -->
          <div class="info-card editing-enabled-banner">
            <h3 style="color: #28a745;">✎ Form Editing Enabled</h3>
            <p *ngIf="application.editingReason" class="editing-reason">
              <strong>Administrator's Message:</strong> {{ application.editingReason }}
            </p>
            <p class="editing-instructions">
              You can now make changes to your application form below and upload updated documents.
            </p>
          </div>

          <!-- Editable Application Data -->
          <div class="info-card">
            <h3>Edit Application Data</h3>
            <form [formGroup]="citizenEditForm" class="edit-form">
              <div *ngFor="let field of editableFields" class="form-group-edit">
                <label [for]="'edit-' + field.key">{{ field.label || field.key }}</label>
                <input 
                  *ngIf="field.type === 'text' || field.type === 'email' || field.type === 'tel' || !field.type"
                  type="{{ field.type || 'text' }}"
                  [id]="'edit-' + field.key"
                  class="form-control"
                  [formControlName]="field.key"
                  [placeholder]="field.placeholder || ''">
                
                <textarea 
                  *ngIf="field.type === 'textarea'"
                  [id]="'edit-' + field.key"
                  class="form-control"
                  [formControlName]="field.key"
                  [placeholder]="field.placeholder || ''"
                  rows="4"></textarea>
                
                <select 
                  *ngIf="field.type === 'select'"
                  [id]="'edit-' + field.key"
                  class="form-control"
                  [formControlName]="field.key">
                  <option value="">-- Select --</option>
                  <option *ngFor="let opt of field.options" [value]="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="form-actions-edit">
                <button 
                  type="button"
                  class="btn btn-primary"
                  (click)="saveEditedForm()"
                  [disabled]="savingEditedForm || citizenEditForm.invalid">
                  {{ savingEditedForm ? 'Saving...' : '💾 Save Changes' }}
                </button>
                <button 
                  type="button"
                  class="btn btn-secondary"
                  (click)="cancelFormEdit()">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Document Upload Section for Editing -->
          <div class="info-card">
            <h3>Update Documents</h3>
            <div class="documents-edit-section">
              <p class="doc-instructions">
                Upload or replace documents as needed. Click "Choose File" to select a new document.
              </p>
              
              <div *ngIf="!application.documents || application.documents.length === 0" class="alert alert-info">
                No documents required for this service.
              </div>
              
              <div *ngFor="let doc of application.documents; let i = index" class="document-item-edit">
                <div class="document-info-edit">
                  <h5>{{ doc.documentType }}</h5>
                  <p *ngIf="doc.documentPath" class="doc-status">
                    ✓ <a [href]="getDocumentUrl(doc.documentPath)" target="_blank">
                      View Current Document
                    </a>
                  </p>
                  <p class="doc-date" *ngIf="doc.uploadedAt">
                    Uploaded: {{ doc.uploadedAt | date:'short' }}
                  </p>
                </div>
                <div class="document-upload-edit">
                  <input 
                    type="file" 
                    #fileInput
                    (change)="onEditDocumentSelected($event, i)"
                    [id]="'edit-doc-' + i"
                    class="file-input-edit"
                    accept=".pdf,.jpg,.jpeg,.png" />
                  <label [for]="'edit-doc-' + i" class="btn btn-upload">
                    {{ uploadingDocs[i] ? 'Uploading...' : '📎 Choose File' }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Success/Error Messages -->
          <div class="info-card" *ngIf="editSuccessMessage">
            <div class="alert alert-success">{{ editSuccessMessage }}</div>
          </div>
          <div class="info-card" *ngIf="editErrorMessage">
            <div class="alert alert-danger">{{ editErrorMessage }}</div>
          </div>
        </div>

        <!-- Submit Application (For Citizen) -->
        <div class="info-card submit-section" *ngIf="currentUser?.role === 'citizen' && canSubmitApplication()">
          <h3>✓ Ready to Submit Application</h3>
          <div class="submit-info">
            <p class="success-message">
              All required documents have been uploaded and payment has been completed. 
              You can now submit your application for processing.
            </p>
            <div class="checklist">
              <div class="checklist-item completed">
                <span class="check-icon">✓</span>
                <span>All required documents uploaded</span>
              </div>
              <div class="checklist-item completed">
                <span class="check-icon">✓</span>
                <span>Payment completed</span>
              </div>
            </div>
            <button 
              class="btn btn-submit-app"
              (click)="submitApplication()"
              [disabled]="submittingApplication">
              {{ submittingApplication ? 'Submitting...' : '📤 Submit Application for Review' }}
            </button>
            <p class="submit-note">
              <strong>Note:</strong> Once submitted, your application will be reviewed by our team. 
              You will be notified of any updates.
            </p>
          </div>
        </div>

        <!-- Actions (For Admin/Employee) -->
        <div class="action-buttons" *ngIf="currentUser?.role !== 'citizen'">
          <select [(ngModel)]="newStatus" class="status-select">
            <option value="">Update Status</option>
            <option value="Under Review">Under Review</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
          <button class="btn-update" (click)="updateStatus()" [disabled]="!newStatus">Update Status</button>
        </div>
      </div>

      <!-- Document Viewer Modal -->
      <div *ngIf="viewingDocument" class="modal-overlay" (click)="closeViewer()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ viewingDocument.title }}</h3>
            <div class="modal-actions">
              <a [href]="environment.baseUrl + '/' + viewingDocument.path" 
                 download 
                 class="download-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Download
              </a>
              <button class="close-btn" (click)="closeViewer()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-body">
            <iframe 
              *ngIf="getFileType(viewingDocument.path) === 'pdf'"
              [src]="getSafeUrl(viewingDocument.path)"
              class="document-viewer"></iframe>
            <img 
              *ngIf="getFileType(viewingDocument.path) === 'image'"
              [src]="environment.baseUrl + '/' + viewingDocument.path"
              class="image-viewer"
              alt="Document">
            <div *ngIf="getFileType(viewingDocument.path) === 'other'" class="unsupported">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Preview not available for this file type</p>
              <a [href]="environment.baseUrl + '/' + viewingDocument.path" 
                 download 
                 class="btn-primary">Download to View</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .detail-header h2 {
      color: #333;
      font-size: 2rem;
    }

    .btn-back {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-back:hover {
      background: #5a6268;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #666;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-card {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .info-card h3 {
      color: #333;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item .value {
      color: #333;
      font-size: 1rem;
    }

    .badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      width: fit-content;
    }

    .status-submitted { background: #e3f2fd; color: #1976d2; }
    .status-under-review { background: #fff3e0; color: #f57c00; }
    .status-approved { background: #e8f5e9; color: #388e3c; }
    .status-rejected { background: #ffebee; color: #d32f2f; }
    .status-completed { background: #e0f2f1; color: #00897b; }
    .status-pending-documents { background: #fce4ec; color: #c2185b; }

    .reassign-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-control {
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #666;
    }

    .payment-pending { background: #fff3e0; color: #f57c00; }
    .payment-paid { background: #e8f5e9; color: #388e3c; }
    .payment-failed { background: #ffebee; color: #d32f2f; }
    .payment-refunded { background: #e3f2fd; color: #1976d2; }

    .payment-actions {
      margin-top: 1.5rem;
    }

    .btn-pay {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: transform 0.3s;
    }

    .btn-pay:hover {
      transform: translateY(-2px);
    }

    .payment-form {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .payment-form h4 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .payment-note {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .payment-methods {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .payment-option {
      background: white;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .payment-option:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
    }

    .payment-option.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .payment-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .payment-label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #666;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-submit {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .document-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .document-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }

    .document-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .document-icon {
      font-size: 2rem;
    }

    .document-details h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }

    .document-status {
      margin: 0;
      font-size: 0.85rem;
      color: #28a745;
    }

    .document-status.pending {
      color: #ffc107;
    }

    .document-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-view-doc, .btn-download-doc {
      background: #007bff;
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: 5px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.3s;
      display: inline-block;
      border: none;
      cursor: pointer;
    }

    .btn-view-doc:hover, .btn-download-doc:hover {
      background: #0056b3;
    }

    .btn-download-doc {
      background: #28a745;
    }

    .btn-download-doc:hover {
      background: #218838;
    }

    .no-document {
      color: #6c757d;
      font-size: 0.9rem;
      font-style: italic;
    }

    .section-description {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .required-docs-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .required-doc-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .required-doc-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: #007bff;
    }

    .doc-number {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .doc-name {
      flex: 1;
      font-weight: 500;
      color: #333;
      font-size: 1rem;
    }

    .doc-status-indicator {
      flex-shrink: 0;
    }

    .uploaded-badge {
      background: #d4edda;
      color: #155724;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .pending-badge {
      background: #fff3cd;
      color: #856404;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .doc-icon {
      font-size: 1.5rem;
    }

    .doc-type {
      flex: 1;
      font-weight: 500;
      color: #333;
    }

    .btn-view {
      background: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      text-decoration: none;
      transition: background 0.3s;
    }

    .btn-view:hover {
      background: #0056b3;
    }

    .required-docs-info {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #e8f4fd;
      border-left: 4px solid #007bff;
      border-radius: 5px;
    }

    .required-docs-info h4 {
      color: #007bff;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .required-doc-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .required-doc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
    }

    .doc-name {
      font-weight: 500;
      color: #333;
    }

    .doc-status {
      font-size: 0.9rem;
      color: #dc3545;
      font-weight: 600;
    }

    .doc-status.uploaded {
      color: #28a745;
    }

    .uploaded-docs {
      margin-bottom: 1.5rem;
    }

    .uploaded-docs h4 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .upload-section {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .upload-section h4 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-control {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .file-input {
      width: 100%;
      padding: 0.8rem;
      border: 2px dashed #ddd;
      border-radius: 5px;
      cursor: pointer;
    }

    .file-note {
      display: block;
      margin-top: 0.5rem;
      color: #666;
      font-size: 0.85rem;
    }

    .selected-file {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .file-icon {
      font-size: 1.2rem;
    }

    .file-name {
      flex: 1;
      color: #333;
    }

    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.3rem 0.6rem;
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-upload {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-upload:hover:not(:disabled) {
      background: #218838;
    }

    .btn-upload:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .remarks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .remark-item {
      padding: 1rem;
      background: #f8f9fa;
      border-left: 3px solid #667eea;
      border-radius: 5px;
    }

    .remark-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .timestamp {
      color: #999;
      font-size: 0.85rem;
    }

    .no-data {
      color: #999;
      font-style: italic;
    }

    .add-remark {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .add-remark textarea {
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
    }

    .btn-add {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      width: fit-content;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .status-select {
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      flex: 1;
      max-width: 300px;
    }

    .btn-update {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-update:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .download-section {
      text-align: center;
      padding: 2rem;
      background: #f0f9ff;
      border-radius: 10px;
    }

    .btn-download {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 1rem 2.5rem;
      border-radius: 30px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      margin: 1rem 0;
      transition: transform 0.3s;
    }

    .btn-download:hover {
      transform: translateY(-2px);
      background: #5568d3;
    }

    .success-message {
      color: #28a745;
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .uploaded-info {
      color: #666;
      font-size: 0.9rem;
      margin-top: 1rem;
    }

    .completed-doc-info {
      padding: 1.5rem;
      background: #e8f5e9;
      border-radius: 8px;
      text-align: center;
    }

    .completed-doc-info .btn-view,
    .completed-doc-info .btn-download {
      margin: 0.5rem;
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      border: none;
      cursor: pointer;
    }

    .completed-doc-info .btn-view {
      background: #007bff;
      color: white;
    }

    .completed-doc-info .btn-view:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }

    .completed-doc-info .btn-download {
      background: #28a745;
      color: white;
    }

    .completed-doc-info .btn-download:hover {
      background: #218838;
      transform: translateY(-2px);
    }


    .alert-info-edit {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .alert-info-edit p {
      margin: 0.5rem 0;
      color: #1976d2;
    }

    .editing-enabled-section {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .editing-disabled-section {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .edit-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .edit-reason {
      min-height: 80px;
      resize: vertical;
    }

    .editing-info-citizen {
      background: #e8f5e9;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }

    .editing-reason {
      color: #2e7d32;
      margin: 0.5rem 0;
      font-style: italic;
    }

    .editing-instructions {
      color: #555;
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .upload-restricted-message {
      margin-top: 2rem;
    }

    .upload-restricted-message .alert {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .upload-restricted-message .alert h4 {
      color: #856404;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
    }

    .upload-restricted-message .alert p {
      color: #856404;
      margin: 0.5rem 0;
      line-height: 1.6;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .modal-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .download-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .modal-body {
      flex: 1;
      overflow: auto;
      padding: 20px;
      background: #f9fafb;
    }

    .document-viewer {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 8px;
      background: white;
    }

    .image-viewer {
      width: 100%;
      height: auto;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 8px;
      background: white;
    }

    .unsupported {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 8px;
    }

    .unsupported svg {
      color: #d1d5db;
      margin-bottom: 20px;
    }

    .unsupported p {
      color: #6b7280;
      font-size: 1.125rem;
      margin: 0 0 20px 0;
    }

    /* Submit Application Section */
    .submit-section {
      border: 2px solid #28a745;
      background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e9 100%);
    }

    .submit-section h3 {
      color: #28a745;
      border-bottom-color: #28a745;
    }

    .submit-info {
      text-align: center;
    }

    .checklist {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1.5rem 0;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .checklist-item.completed {
      border-left: 4px solid #28a745;
    }

    .check-icon {
      font-size: 1.5rem;
      color: #28a745;
      font-weight: bold;
    }

    .btn-submit-app {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 1rem 3rem;
      border-radius: 30px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1.5rem 0;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }

    .btn-submit-app:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    }

    .btn-submit-app:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .submit-note {
      color: #666;
      font-size: 0.9rem;
      max-width: 600px;
      margin: 1rem auto 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
    }

    .editing-enabled-banner {
      background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .editing-enabled-banner h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .editing-enabled-banner p {
      margin: 0;
      opacity: 0.95;
      font-size: 0.95rem;
    }

    .edit-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-group-edit {
      margin-bottom: 1.5rem;
    }

    .form-group-edit label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .form-group-edit input,
    .form-group-edit select,
    .form-group-edit textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group-edit input:focus,
    .form-group-edit select:focus,
    .form-group-edit textarea:focus {
      outline: none;
      border-color: #2196F3;
    }

    .form-group-edit input.ng-invalid.ng-touched,
    .form-group-edit select.ng-invalid.ng-touched {
      border-color: #f44336;
    }

    .form-actions-edit {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 2px solid #f0f0f0;
    }

    .form-actions-edit button {
      padding: 0.875rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .form-actions-edit .btn-primary {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .form-actions-edit .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
    }

    .form-actions-edit .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-actions-edit .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }

    .form-actions-edit .btn-secondary:hover {
      background: #e0e0e0;
    }

    .alert {
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .alert-danger {
      background: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .documents-edit-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .doc-instructions {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .document-item-edit {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: #f9f9f9;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 1rem;
      transition: all 0.2s;
    }

    .document-item-edit:hover {
      border-color: #2196F3;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
    }

    .document-info-edit h5 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .doc-status {
      margin: 0.5rem 0;
      color: #28a745;
      font-size: 0.9rem;
    }

    .doc-status a {
      color: #2196F3;
      text-decoration: none;
      margin-left: 0.25rem;
    }

    .doc-status a:hover {
      text-decoration: underline;
    }

    .doc-date {
      margin: 0.5rem 0 0 0;
      color: #666;
      font-size: 0.85rem;
    }

    .document-upload-edit {
      display: flex;
      align-items: center;
    }

    .file-input-edit {
      display: none;
    }

    .btn-upload {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    }

    .btn-upload:hover {
      background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  environment = environment;
  application: any = null;
  loading = true;
  currentUser: any = null;
  newRemark = '';
  newStatus = '';
  showPaymentForm = false;
  paymentData = {
    paymentMethod: ''
  };
  uploadDocType = '';
  customDocType = '';
  selectedFile: File | null = null;
  uploading = false;
  employees: any[] = [];
  selectedEmployeeId = '';
  reassigning = false;
  completedDocFile: File | null = null;
  uploadingCompleted = false;
  editingReason = '';
  disableEditingReason = '';
  enablingEditing = false;
  disablingEditing = false;
  viewingDocument: any = null;
  submittingApplication = false;
  citizenEditForm: FormGroup;
  editableFields: any[] = [];
  savingEditedForm = false;
  editSuccessMessage = '';
  editErrorMessage = '';
  uploadingDocs: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    this.citizenEditForm = this.fb.group({});
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
    if (this.currentUser?.role === 'admin') {
      this.loadEmployees();
    }
  }

  loadApplication(id: string): void {
    this.loading = true;
    const endpoint = this.currentUser?.role === 'citizen' 
      ? `${environment.apiUrl}/citizen/applications/${id}`
      : this.currentUser?.role === 'employee'
      ? `${environment.apiUrl}/employee/applications/${id}`
      : `${environment.apiUrl}/admin/applications/${id}`;

    this.http.get<any>(endpoint).subscribe({
      next: (response) => {
        this.application = response.data;
        this.loading = false;
        // Initialize edit form if editing is enabled for citizen
        if (this.currentUser?.role === 'citizen' && this.application.editingEnabled) {
          this.initializeEditForm();
        }
      },
      error: (error) => {
        console.error('Error loading application:', error);
        alert('Failed to load application details');
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (response) => {
        this.employees = response.data.filter((user: any) => user.role === 'employee');
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  reassignEmployee(): void {
    if (!this.selectedEmployeeId) return;

    this.reassigning = true;
    this.http.put<any>(
      `${environment.apiUrl}/admin/applications/${this.application._id}/assign`,
      { employeeId: this.selectedEmployeeId }
    ).subscribe({
      next: (response) => {
        alert('Application reassigned successfully!');
        this.reassigning = false;
        this.selectedEmployeeId = '';
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Error reassigning:', error);
        alert(error.error?.message || 'Failed to reassign application');
        this.reassigning = false;
      }
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }

  processPayment(): void {
    if (!this.paymentData.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.http.post<any>(
      `${environment.apiUrl}/payments/${this.application._id}/process`,
      { paymentMethod: this.paymentData.paymentMethod }
    ).subscribe({
      next: (response) => {
        alert('Payment processed successfully!');
        this.showPaymentForm = false;
        this.paymentData = { paymentMethod: '' };
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      }
    });
  }

  addRemark(): void {
    if (!this.newRemark.trim()) {
      return;
    }

    const endpoint = this.currentUser?.role === 'employee'
      ? `${environment.apiUrl}/employee/applications/${this.application._id}/remarks`
      : `${environment.apiUrl}/admin/applications/${this.application._id}/remarks`;

    this.http.post<any>(endpoint, { comment: this.newRemark }).subscribe({
      next: (response) => {
        this.newRemark = '';
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Error adding remark:', error);
        alert('Failed to add remark');
      }
    });
  }

  updateStatus(): void {
    if (!this.newStatus) {
      return;
    }

    const endpoint = this.currentUser?.role === 'employee'
      ? `${environment.apiUrl}/employee/applications/${this.application._id}/status`
      : `${environment.apiUrl}/admin/applications/${this.application._id}`;

    this.http.put<any>(endpoint, { status: this.newStatus }).subscribe({
      next: (response) => {
        alert('Status updated successfully!');
        this.newStatus = '';
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      }
    });
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  canUpload(): boolean {
    if (!this.selectedFile) return false;
    if (this.uploadDocType === 'Other' && !this.customDocType.trim()) return false;
    if (!this.uploadDocType) return false;
    return true;
  }

  uploadDocument(): void {
    if (!this.canUpload()) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('documents', this.selectedFile!);
    
    const docType = this.uploadDocType === 'Other' ? this.customDocType : this.uploadDocType;
    formData.append('documentType', docType);

    this.http.post<any>(
      `${environment.apiUrl}/citizen/applications/${this.application._id}/documents`,
      formData
    ).subscribe({
      next: (response) => {
        alert('Document uploaded successfully!');
        this.uploading = false;
        this.selectedFile = null;
        this.uploadDocType = '';
        this.customDocType = '';
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert(error.error?.message || 'Failed to upload document. Please try again.');
        this.uploading = false;
      }
    });
  }

  onCompletedFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        event.target.value = '';
        return;
      }
      this.completedDocFile = file;
    }
  }

  removeCompletedFile(): void {
    this.completedDocFile = null;
  }

  uploadCompletedDocument(): void {
    if (!this.completedDocFile) return;

    this.uploadingCompleted = true;
    const formData = new FormData();
    formData.append('document', this.completedDocFile);

    // Use different endpoint based on role
    const endpoint = this.currentUser?.role === 'admin' 
      ? `${environment.apiUrl}/admin/applications/${this.application._id}/completed-document`
      : `${environment.apiUrl}/employee/applications/${this.application._id}/completed-document`;

    this.http.post<any>(endpoint, formData).subscribe({
      next: (response) => {
        alert('Completed document uploaded successfully!');
        this.uploadingCompleted = false;
        this.completedDocFile = null;
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert(error.error?.message || 'Failed to upload document. Please try again.');
        this.uploadingCompleted = false;
      }
    });
  }

  enableEditing(): void {
    if (!this.editingReason.trim()) {
      alert('Please provide a reason for enabling editing');
      return;
    }

    this.enablingEditing = true;
    this.http.put<any>(
      `${environment.apiUrl}/applications/${this.application._id}/enable-editing`,
      { reason: this.editingReason }
    ).subscribe({
      next: (response) => {
        alert('Form editing enabled! The applicant will be notified and can now edit their application.');
        this.editingReason = '';
        this.enablingEditing = false;
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Error enabling editing:', error);
        alert(error.error?.message || 'Failed to enable editing');
        this.enablingEditing = false;
      }
    });
  }

  disableEditing(): void {
    this.disablingEditing = true;
    this.http.put<any>(
      `${environment.apiUrl}/applications/${this.application._id}/disable-editing`,
      {}
    ).subscribe({
      next: (response) => {
        alert('Form editing disabled.');
        this.disableEditingReason = '';
        this.disablingEditing = false;
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Error disabling editing:', error);
        alert(error.error?.message || 'Failed to disable editing');
        this.disablingEditing = false;
      }
    });
  }

  viewDocument(path: string, title: string): void {
    this.viewingDocument = {
      path: path,
      title: title
    };
  }

  closeViewer(): void {
    this.viewingDocument = null;
  }

  getFileType(path: string): 'pdf' | 'image' | 'other' {
    if (!path) return 'other';
    const ext = path.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'other';
  }

  getSafeUrl(path: string): SafeResourceUrl {
    const url = `${environment.baseUrl}/${path}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getDocumentUrl(path: string): string {
    return `${environment.baseUrl}/${path}`;
  }

  isDocumentUploaded(docType: string): boolean {
    if (!this.application?.documents || !Array.isArray(this.application.documents)) {
      return false;
    }
    return this.application.documents.some((doc: any) => doc.documentType === docType && doc.documentPath);
  }

  canUploadDocuments(): boolean {
    // Citizens can only upload documents if:
    // 1. Status is "Submitted" or "Pending Documents"
    // 2. Status is NOT "Under Review", "Approved", "Rejected", or "Completed"
    const allowedStatuses = ['Submitted', 'Pending Documents'];
    return allowedStatuses.includes(this.application?.status);
  }

  canSubmitApplication(): boolean {
    // Only show submit button if:
    // 1. Application exists and is not in final states
    // 2. All required documents are uploaded
    // 3. Payment is completed
    // 4. Status is still "Submitted" or "Pending Documents"
    
    if (!this.application) return false;
    
    // Don't show if already under review or completed
    const allowedStatuses = ['Submitted', 'Pending Documents'];
    if (!allowedStatuses.includes(this.application.status)) return false;
    
    // Check if all required documents are uploaded
    const requiredDocs = this.application.service?.requiredDocuments || [];
    if (requiredDocs.length > 0) {
      const allDocsUploaded = requiredDocs.every((docType: string) => 
        this.isDocumentUploaded(docType)
      );
      if (!allDocsUploaded) return false;
    }
    
    // Check if payment is completed (status can be 'Paid' or 'Completed')
    if (!this.application.payment || 
        (this.application.payment.status !== 'Paid' && 
         this.application.payment.status !== 'Completed')) {
      return false;
    }
    
    return true;
  }

  submitApplication(): void {
    if (!this.canSubmitApplication()) {
      alert('Please ensure all documents are uploaded and payment is completed before submitting.');
      return;
    }

    if (!confirm('Are you sure you want to submit your application for review? Once submitted, it will be processed by our team.')) {
      return;
    }

    this.submittingApplication = true;

    this.http.put<any>(
      `${environment.apiUrl}/citizen/applications/${this.application._id}/submit-for-review`,
      {}
    ).subscribe({
      next: (response) => {
        alert('Application submitted successfully! You will be notified of any updates.');
        this.submittingApplication = false;
        this.loadApplication(this.application._id);
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        alert(error.error?.message || 'Failed to submit application. Please try again.');
        this.submittingApplication = false;
      }
    });
  }

  initializeEditForm(): void {
    // Extract editable fields from applicationData
    const formData = this.application.applicationData || {};
    this.editableFields = [];
    const formControls: any = {};

    // Build form controls from application data
    Object.keys(formData).forEach(key => {
      const field = {
        key: key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: formData[key],
        type: this.getFieldType(formData[key])
      };
      this.editableFields.push(field);
      formControls[key] = new FormControl(formData[key], Validators.required);
    });

    this.citizenEditForm = this.fb.group(formControls);
  }

  getFieldType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    if (value && value.toString().includes('@')) return 'email';
    if (value && value.toString().match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
    return 'text';
  }

  saveEditedForm(): void {
    if (this.citizenEditForm.invalid) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (!confirm('Are you sure you want to save these changes?')) {
      return;
    }

    this.savingEditedForm = true;
    this.editSuccessMessage = '';
    this.editErrorMessage = '';

    const updatedData = this.citizenEditForm.value;

    this.http.put<any>(
      `${environment.apiUrl}/citizen/applications/${this.application._id}/edit-form`,
      { applicationData: updatedData }
    ).subscribe({
      next: (response) => {
        this.editSuccessMessage = 'Application updated successfully!';
        this.savingEditedForm = false;
        // Reload to get updated data
        setTimeout(() => {
          this.loadApplication(this.application._id);
          this.editSuccessMessage = '';
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving edited form:', error);
        this.editErrorMessage = error.error?.message || 'Failed to save changes. Please try again.';
        this.savingEditedForm = false;
      }
    });
  }

  cancelFormEdit(): void {
    if (confirm('Are you sure you want to discard your changes?')) {
      this.initializeEditForm(); // Reset to original values
      this.editSuccessMessage = '';
      this.editErrorMessage = '';
    }
  }

  onEditDocumentSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingDocs[index] = true;
    this.editErrorMessage = '';
    this.editSuccessMessage = '';

    const formData = new FormData();
    formData.append('documents', file);
    formData.append('documentType', this.application.documents[index].documentType);

    this.http.post(
      `${environment.apiUrl}/citizen/applications/${this.application._id}/documents`,
      formData
    ).subscribe({
      next: (response: any) => {
        this.uploadingDocs[index] = false;
        this.editSuccessMessage = `Document "${this.application.documents[index].documentType}" uploaded successfully`;
        setTimeout(() => {
          this.editSuccessMessage = '';
          this.loadApplication(this.application._id);
        }, 2000);
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.editErrorMessage = `Failed to upload document: ${error.error?.message || 'Unknown error'}`;
        this.uploadingDocs[index] = false;
      }
    });
  }
}
