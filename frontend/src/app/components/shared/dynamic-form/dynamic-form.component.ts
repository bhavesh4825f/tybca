import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dynamic-form">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div *ngFor="let field of sortedFields" class="form-field">
          <!-- Text, Email, Number, Tel, Date -->
          <div *ngIf="['text', 'email', 'number', 'tel', 'date'].includes(field.fieldType)" class="form-group">
            <label>
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <input 
              [type]="field.fieldType"
              [formControlName]="field.fieldName"
              [placeholder]="field.placeholder || ''"
              class="form-control"
              [class.error]="isFieldInvalid(field.fieldName)">
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>

          <!-- Textarea -->
          <div *ngIf="field.fieldType === 'textarea'" class="form-group">
            <label>
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <textarea
              [formControlName]="field.fieldName"
              [placeholder]="field.placeholder || ''"
              class="form-control"
              rows="4"
              [class.error]="isFieldInvalid(field.fieldName)">
            </textarea>
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>

          <!-- Select Dropdown -->
          <div *ngIf="field.fieldType === 'select'" class="form-group">
            <label>
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <select
              [formControlName]="field.fieldName"
              class="form-control"
              [class.error]="isFieldInvalid(field.fieldName)">
              <option value="">Select an option</option>
              <option *ngFor="let option of field.options" [value]="option">{{ option }}</option>
            </select>
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>

          <!-- Radio Buttons -->
          <div *ngIf="field.fieldType === 'radio'" class="form-group">
            <label>
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <div class="radio-group">
              <label *ngFor="let option of field.options" class="radio-label">
                <input 
                  type="radio"
                  [formControlName]="field.fieldName"
                  [value]="option">
                {{ option }}
              </label>
            </div>
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>

          <!-- Checkboxes (single checkbox for boolean) -->
          <div *ngIf="field.fieldType === 'checkbox' && (!field.options || field.options.length === 0)" class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox"
                [formControlName]="field.fieldName">
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>

          <!-- Multiple Checkboxes -->
          <div *ngIf="field.fieldType === 'checkbox' && field.options && field.options.length > 0" class="form-group">
            <label>
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <div class="checkbox-group">
              <label *ngFor="let option of field.options" class="checkbox-label">
                <input 
                  type="checkbox"
                  [value]="option"
                  (change)="onCheckboxChange(field.fieldName, option, $event)">
                {{ option }}
              </label>
            </div>
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>

          <!-- File Upload -->
          <div *ngIf="field.fieldType === 'file'" class="form-group">
            <label>
              {{ field.fieldLabel }}
              <span *ngIf="field.required" class="required">*</span>
            </label>
            <input 
              type="file"
              (change)="onFileChange(field.fieldName, $event)"
              class="form-control"
              [class.error]="isFieldInvalid(field.fieldName)">
            <div *ngIf="isFieldInvalid(field.fieldName)" class="error-message">
              {{ getErrorMessage(field) }}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting">
            {{ submitting ? 'Submitting...' : 'Next Step' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dynamic-form {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-field {
      margin-bottom: 25px;
    }

    .form-group {
      width: 100%;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .required {
      color: #e74c3c;
      margin-left: 3px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .radio-group,
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .radio-label,
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 400;
      cursor: pointer;
    }

    .radio-label input,
    .checkbox-label input {
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .btn {
      padding: 10px 25px;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }
  `]
})
export class DynamicFormComponent implements OnInit {
  @Input() formSchema: any[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  sortedFields: any[] = [];
  submitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    // Sort fields by order
    this.sortedFields = [...this.formSchema].sort((a, b) => a.order - b.order);

    const group: any = {};

    this.sortedFields.forEach(field => {
      const validators = [];

      // Required validator
      if (field.required) {
        validators.push(Validators.required);
      }

      // Email validator
      if (field.fieldType === 'email') {
        validators.push(Validators.email);
      }

      // Min/Max length validators
      if (field.validation) {
        if (field.validation.minLength) {
          validators.push(Validators.minLength(field.validation.minLength));
        }
        if (field.validation.maxLength) {
          validators.push(Validators.maxLength(field.validation.maxLength));
        }
        if (field.validation.min !== undefined) {
          validators.push(Validators.min(field.validation.min));
        }
        if (field.validation.max !== undefined) {
          validators.push(Validators.max(field.validation.max));
        }
        if (field.validation.pattern) {
          validators.push(Validators.pattern(field.validation.pattern));
        }
      }

      // Initialize with appropriate default value
      let defaultValue: any = '';
      if (field.fieldType === 'checkbox' && (!field.options || field.options.length === 0)) {
        defaultValue = false;
      } else if (field.fieldType === 'checkbox' && field.options && field.options.length > 0) {
        defaultValue = [];
      } else if (field.fieldType === 'number') {
        defaultValue = null;
      }

      group[field.fieldName] = [defaultValue, validators];
    });

    this.form = this.fb.group(group);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(field: any): string {
    const control = this.form.get(field.fieldName);
    if (!control || !control.errors) return '';

    // Custom validation message
    if (field.validation?.message && Object.keys(control.errors).length > 0) {
      return field.validation.message;
    }

    // Default error messages
    if (control.errors['required']) {
      return `${field.fieldLabel} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    }
    if (control.errors['min']) {
      return `Minimum value is ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `Maximum value is ${control.errors['max'].max}`;
    }
    if (control.errors['pattern']) {
      return field.validation?.message || 'Invalid format';
    }

    return 'Invalid input';
  }

  onCheckboxChange(fieldName: string, option: string, event: any): void {
    const control = this.form.get(fieldName);
    if (!control) return;

    const currentValue: string[] = control.value || [];
    
    if (event.target.checked) {
      control.setValue([...currentValue, option]);
    } else {
      control.setValue(currentValue.filter((val: string) => val !== option));
    }
  }

  onFileChange(fieldName: string, event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ [fieldName]: file });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.formSubmit.emit(this.form.value);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  resetSubmitting(): void {
    this.submitting = false;
  }
}
