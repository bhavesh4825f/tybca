import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../../../services/service.service';

interface FormField {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
}

@Component({
  selector: 'app-service-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="service-builder">
      <!-- Professional Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <button class="back-btn" (click)="goBack()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Back
            </button>
            <div class="header-title">
              <h1>{{ isEditMode ? 'Edit Service' : 'Create New Service' }}</h1>
              <p class="subtitle">{{ isEditMode ? 'Update service details and configuration' : 'Configure a new government service for citizens' }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-outline" (click)="goBack()">Cancel</button>
            <button class="btn-primary" (click)="saveService()" [disabled]="saving">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" *ngIf="!saving">
                <path d="M13.5 2.25H4.5C3.67157 2.25 3 2.92157 3 3.75V14.25C3 15.0784 3.67157 15.75 4.5 15.75H13.5C14.3284 15.75 15 15.0784 15 14.25V3.75C15 2.92157 14.3284 2.25 13.5 2.25Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M11.25 2.25V6H6.75V2.25" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6.75 11.25H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span *ngIf="!saving">{{ isEditMode ? 'Update Service' : 'Create Service' }}</span>
              <span *ngIf="saving">Saving...</span>
            </button>
          </div>
        </div>
      </div>

      <div class="builder-container">
        <!-- Progress Indicator -->
        <div class="progress-steps">
          <div class="step active">
            <div class="step-number">1</div>
            <div class="step-label">Basic Info</div>
          </div>
          <div class="step-line"></div>
          <div class="step active">
            <div class="step-number">2</div>
            <div class="step-label">Documents</div>
          </div>
          <div class="step-line"></div>
          <div class="step active">
            <div class="step-number">3</div>
            <div class="step-label">Form Fields</div>
          </div>
          <div class="step-line"></div>
          <div class="step active">
            <div class="step-number">4</div>
            <div class="step-label">Payment</div>
          </div>
        </div>

        <!-- Section 1: Basic Service Info -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3>Basic Information</h3>
              <p>Define the core details of the service</p>
            </div>
          </div>
          
          <div class="section-content">
            <div class="input-group">
              <label class="input-label">
                Service Name <span class="required">*</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="service.name" 
                class="input-field" 
                placeholder="e.g., PAN Card Application, Driving License"
              >
            </div>

            <div class="input-group">
              <label class="input-label">
                Description <span class="required">*</span>
              </label>
              <textarea 
                [(ngModel)]="service.description" 
                class="input-field textarea" 
                rows="4" 
                placeholder="Provide a detailed description of the service, its purpose, and benefits"
              ></textarea>
            </div>

            <div class="grid-3">
              <div class="input-group">
                <label class="input-label">
                  Category <span class="required">*</span>
                </label>
                <select [(ngModel)]="service.category" class="input-field select">
                  <option value="">Select Category</option>
                  <option value="Certificate">📜 Certificate</option>
                  <option value="License">🪪 License</option>
                  <option value="Registration">📋 Registration</option>
                  <option value="Pension">💰 Pension</option>
                  <option value="Subsidy">🎁 Subsidy</option>
                  <option value="Other">📌 Other</option>
                </select>
              </div>

              <div class="input-group">
                <label class="input-label">
                  Service Fee <span class="required">*</span>
                </label>
                <div class="input-with-prefix">
                  <span class="prefix">₹</span>
                  <input 
                    type="number" 
                    [(ngModel)]="service.fee" 
                    class="input-field with-prefix" 
                    placeholder="0"
                    min="0"
                  >
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Processing Time</label>
                <input 
                  type="text" 
                  [(ngModel)]="service.processingTime" 
                  class="input-field" 
                  placeholder="e.g., 7-10 business days"
                >
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Eligibility Criteria</label>
              <textarea 
                [(ngModel)]="service.eligibilityCriteria" 
                class="input-field textarea" 
                rows="3" 
                placeholder="Specify who can apply for this service (e.g., Indian citizens above 18 years)"
              ></textarea>
            </div>

            <div class="toggle-group">
              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="service.isActive" class="toggle-input">
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>Service is Active</strong>
                  <small>Citizens can view and apply for this service</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Section 2: Required Documents -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM5 22C4.45 22 3.979 21.804 3.587 21.412C3.195 21.02 2.99933 20.5493 3 20V4C3 3.45 3.196 2.979 3.588 2.587C3.98 2.195 4.45067 1.99933 5 2H14L20 8V20C20 20.55 19.804 21.021 19.412 21.413C19.02 21.805 18.5493 22.0007 18 22H5ZM13 9V4H5V20H18V9H13Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3>Required Documents</h3>
              <p>Specify documents citizens need to submit</p>
            </div>
          </div>
          
          <div class="section-content">
            <div class="document-list">
              <div *ngFor="let doc of service.requiredDocuments; let i = index; trackBy: trackByIndex" class="document-item">
                <span class="document-number">{{ i + 1 }}</span>
                <input 
                  type="text" 
                  [ngModel]="service.requiredDocuments[i]"
                  (ngModelChange)="service.requiredDocuments[i] = $event"
                  class="input-field" 
                  placeholder="e.g., Aadhaar Card, Address Proof, Photo ID"
                >
                <button class="btn-icon-danger" (click)="removeDocument(i)" title="Remove document">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <button class="btn-secondary" (click)="addDocument()">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 4.5V13.5M4.5 9H13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add Document
            </button>
          </div>
        </div>

        <!-- Section 3: Dynamic Form Builder -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 8H17M7 12H17M7 16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3>Application Form Fields</h3>
              <p>Design the custom form that citizens will complete when applying</p>
            </div>
          </div>
          
          <div class="section-content">
            <div class="form-fields-list" *ngIf="service.formSchema.length > 0">
              <div *ngFor="let field of service.formSchema; let i = index" class="field-card">
                <div class="field-header">
                  <div class="field-badge">Field {{ i + 1 }}</div>
                  <button class="btn-icon-danger" (click)="removeField(i)" title="Delete field">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6 2.25H12M2.25 4.5H15.75M13.5 4.5V14.25C13.5 15.075 12.825 15.75 12 15.75H6C5.175 15.75 4.5 15.075 4.5 14.25V4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    Delete Field
                  </button>
                </div>
                
                <div class="field-body">
                  <div class="grid-2">
                    <div class="input-group">
                      <label class="input-label">
                        Field Name (ID) <span class="required">*</span>
                        <span class="hint">Internal identifier (camelCase)</span>
                      </label>
                      <input 
                        type="text" 
                        [(ngModel)]="field.fieldName" 
                        class="input-field" 
                        placeholder="e.g., applicantName"
                      >
                    </div>
                    <div class="input-group">
                      <label class="input-label">
                        Field Label <span class="required">*</span>
                        <span class="hint">Display label for users</span>
                      </label>
                      <input 
                        type="text" 
                        [(ngModel)]="field.fieldLabel" 
                        class="input-field" 
                        placeholder="e.g., Applicant Full Name"
                      >
                    </div>
                  </div>
                  
                  <div class="grid-3">
                    <div class="input-group">
                      <label class="input-label">Field Type <span class="required">*</span></label>
                      <select [(ngModel)]="field.fieldType" class="input-field select">
                        <option value="text">📝 Text</option>
                        <option value="email">📧 Email</option>
                        <option value="number">🔢 Number</option>
                        <option value="tel">📱 Phone</option>
                        <option value="date">📅 Date</option>
                        <option value="select">📋 Dropdown</option>
                        <option value="textarea">📄 Text Area</option>
                        <option value="file">📎 File Upload</option>
                        <option value="checkbox">☑️ Checkbox</option>
                        <option value="radio">🔘 Radio Button</option>
                      </select>
                    </div>
                    <div class="input-group">
                      <label class="input-label">Placeholder Text</label>
                      <input 
                        type="text" 
                        [(ngModel)]="field.placeholder" 
                        class="input-field" 
                        placeholder="Hint for users"
                      >
                    </div>
                  </div>

                  <div class="toggle-group">
                    <label class="toggle-label compact">
                      <input type="checkbox" [(ngModel)]="field.required" class="toggle-input">
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">
                        <strong>Required Field</strong>
                        <small>This field must be filled</small>
                      </span>
                    </label>
                  </div>

                  <!-- Options for select/radio/checkbox -->
                  <div *ngIf="field.fieldType === 'select' || field.fieldType === 'radio' || field.fieldType === 'checkbox'" class="input-group highlight">
                    <label class="input-label">
                      Options <span class="required">*</span>
                      <span class="hint">Separate with commas</span>
                    </label>
                    <input 
                      type="text" 
                      [ngModel]="field.options?.join(', ')" 
                      (ngModelChange)="updateOptions(field, $event)" 
                      class="input-field" 
                      placeholder="Option 1, Option 2, Option 3"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="service.formSchema.length === 0">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
                <path d="M32 24V40M24 32H40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h4>No form fields added yet</h4>
              <p>Start building your application form by adding fields below</p>
            </div>

            <button class="btn-add-field" (click)="addField()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add Form Field
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .service-builder {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
      padding-bottom: 40px;
    }

    /* Professional Header */
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 40px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
      flex: 1;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateX(-2px);
    }

    .header-title h1 {
      margin: 0 0 6px 0;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 0;
      font-size: 0.95rem;
      opacity: 0.9;
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .btn-primary {
      background: white;
      border: none;
      color: #667eea;
      padding: 10px 28px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Progress Steps */
    .progress-steps {
      max-width: 1200px;
      margin: -20px auto 40px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .step-number {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: white;
      color: #9ca3af;
      border: 3px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .step-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #9ca3af;
    }

    .step.active .step-label {
      color: #667eea;
    }

    .step-line {
      width: 100px;
      height: 3px;
      background: #e5e7eb;
      margin: 0 -10px;
      margin-bottom: 28px;
    }

    .step.active + .step-line {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    /* Container */
    .builder-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px;
    }

    /* Section Cards */
    .section-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      margin-bottom: 32px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .section-card:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }

    .section-header {
      background: linear-gradient(135deg, #f8f9fc 0%, #eef1f7 100%);
      padding: 24px 32px;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .section-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .section-header h3 {
      margin: 0 0 4px 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #1f2937;
    }

    .section-header p {
      margin: 0;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .section-content {
      padding: 32px;
    }

    /* Form Elements */
    .input-group {
      margin-bottom: 24px;
    }

    .input-label {
      display: block;
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;
      margin-bottom: 8px;
    }

    .required {
      color: #ef4444;
      margin-left: 2px;
    }

    .hint {
      display: block;
      font-size: 0.8rem;
      color: #9ca3af;
      font-weight: 400;
      margin-top: 2px;
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.3s ease;
      background: white;
    }

    .input-field:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .input-field.textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.6;
    }

    .input-field.select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236b7280' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 48px;
    }

    .input-field.monospace {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .prefix {
      position: absolute;
      left: 16px;
      font-weight: 600;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .input-field.with-prefix {
      padding-left: 36px;
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    @media (max-width: 768px) {
      .grid-2, .grid-3 {
        grid-template-columns: 1fr;
      }
    }

    /* Toggle Switch */
    .toggle-group {
      margin: 24px 0;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      user-select: none;
    }

    .toggle-label.compact {
      margin: 16px 0;
    }

    .toggle-input {
      display: none;
    }

    .toggle-slider {
      position: relative;
      width: 52px;
      height: 28px;
      background: #d1d5db;
      border-radius: 28px;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .toggle-slider::after {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle-input:checked + .toggle-slider {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .toggle-input:checked + .toggle-slider::after {
      transform: translateX(24px);
    }

    .toggle-text strong {
      display: block;
      color: #374151;
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    .toggle-text small {
      display: block;
      color: #9ca3af;
      font-size: 0.85rem;
    }

    /* Documents List */
    .document-list {
      margin-bottom: 20px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      background: #f9fafb;
      padding: 8px;
      border-radius: 10px;
    }

    .document-number {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    /* Buttons */
    .btn-secondary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-icon-danger {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .btn-icon-danger:hover {
      background: #fecaca;
      border-color: #fca5a5;
    }

    /* Field Cards */
    .field-card {
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .field-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
    }

    .field-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-badge {
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.02em;
    }

    .field-header .btn-icon-danger {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      gap: 6px;
      padding: 8px 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .field-header .btn-icon-danger:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .field-body {
      padding: 28px;
    }

    /* Validation Section */
    .validation-section {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
    }

    .validation-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      color: #667eea;
    }

    .validation-header h5 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #374151;
    }

    .highlight {
      background: #fef3c7;
      padding: 16px;
      border-radius: 10px;
      border: 2px solid #fde047;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #9ca3af;
    }

    .empty-state svg {
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      color: #6b7280;
      font-size: 1.15rem;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.95rem;
    }

    /* Add Field Button */
    .btn-add-field {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      color: white;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .btn-add-field:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header {
        padding: 24px 20px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions button {
        flex: 1;
      }

      .builder-container {
        padding: 0 20px;
      }

      .section-content {
        padding: 20px;
      }

      .progress-steps {
        padding: 0 20px;
        overflow-x: auto;
      }

      .step-line {
        width: 60px;
      }
    }
  `]
})
export class ServiceBuilderComponent implements OnInit {
  service: any = {
    name: '',
    description: '',
    category: '',
    fee: 0,
    processingTime: '7-10 days',
    eligibilityCriteria: '',
    isActive: true,
    requiredDocuments: [''],
    formSchema: []
  };
  isEditMode = false;
  serviceId: string | null = null;
  saving = false;

  constructor(
    private serviceService: ServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.isEditMode = true;
      this.loadService();
    }
  }

  loadService(): void {
    if (!this.serviceId) return;
    
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (response: any) => {
        this.service = response.data;
        if (!this.service.formSchema) {
          this.service.formSchema = [];
        }
        if (!this.service.requiredDocuments || this.service.requiredDocuments.length === 0) {
          this.service.requiredDocuments = [''];
        }
      },
      error: (error: any) => {
        console.error('Error loading service:', error);
        alert('Failed to load service');
      }
    });
  }

  addDocument(): void {
    this.service.requiredDocuments.push('');
  }

  removeDocument(index: number): void {
    this.service.requiredDocuments.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  addField(): void {
    this.service.formSchema.push({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      required: false,
      placeholder: '',
      options: [],
      validation: {},
      order: this.service.formSchema.length
    });
  }

  removeField(index: number): void {
    this.service.formSchema.splice(index, 1);
  }

  updateOptions(field: FormField, value: string): void {
    field.options = value.split(',').map(opt => opt.trim()).filter(opt => opt);
  }

  saveService(): void {
    if (!this.validateService()) {
      return;
    }

    this.saving = true;

    // Clean up empty documents
    this.service.requiredDocuments = this.service.requiredDocuments.filter((doc: string) => doc.trim());

    // Sort form fields by order
    this.service.formSchema.sort((a: FormField, b: FormField) => a.order - b.order);

    const request = this.isEditMode
      ? this.serviceService.updateService(this.serviceId!, this.service)
      : this.serviceService.createService(this.service);

    request.subscribe({
      next: (response: any) => {
        alert(this.isEditMode ? 'Service updated successfully!' : 'Service created successfully!');
        this.router.navigate(['/admin/services']);
      },
      error: (error: any) => {
        console.error('Error saving service:', error);
        alert('Failed to save service: ' + (error.error?.message || 'Unknown error'));
        this.saving = false;
      }
    });
  }

  validateService(): boolean {
    if (!this.service.name || !this.service.description || !this.service.category) {
      alert('Please fill all required fields (Name, Description, Category)');
      return false;
    }

    // Validate form fields
    for (let i = 0; i < this.service.formSchema.length; i++) {
      const field = this.service.formSchema[i];
      if (!field.fieldName || !field.fieldLabel || !field.fieldType) {
        alert(`Form field ${i + 1} is incomplete. Please fill Field Name, Label, and Type.`);
        return false;
      }
    }

    return true;
  }

  goBack(): void {
    this.router.navigate(['/admin/services']);
  }
}
