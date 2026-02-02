import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { ApplicationService } from '../../../services/application.service';
import { Router } from '@angular/router';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-apply-service',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFormComponent],
  template: `
    <div class="apply-service">
      <!-- Modern Header -->
      <div class="page-header">
        <div class="header-content">
          <svg class="header-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="url(#grad1)"/>
            <path d="M32 18V32L40 40" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          <h1>Apply for Services</h1>
          <p class="subtitle">Select and apply for government services in minutes</p>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="successMessage" class="alert alert-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ errorMessage }}
      </div>

      <!-- Service Selection -->
      <div *ngIf="!showDynamicForm" class="selection-container">
        <!-- Search and Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrapper">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2"/>
              <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              [(ngModel)]="searchTerm" 
              placeholder="Search services by name or description..."
              (ngModelChange)="filterServices()">
            <button *ngIf="searchTerm" class="clear-search" (click)="searchTerm=''; filterServices()">×</button>
          </div>
          <select class="category-select" [(ngModel)]="selectedCategory" (ngModelChange)="filterServices()">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
        </div>

        <!-- Service Count -->
        <div class="results-info">
          <span class="count">{{ filteredServices.length }} service{{ filteredServices.length !== 1 ? 's' : '' }} available</span>
        </div>

        <!-- Services Grid -->
        <div class="services-grid" *ngIf="filteredServices.length > 0">
          <div 
            *ngFor="let service of filteredServices" 
            class="service-card"
            [class.selected]="selectedServiceId === service._id"
            (click)="selectService(service)">
            
            <div class="card-badge">{{ service.category }}</div>
            
            <div class="card-icon">
              {{ getCategoryIcon(service.category) }}
            </div>
            
            <h3 class="card-title">{{ service.name }}</h3>
            <p class="card-description">{{ service.description }}</p>
            
            <div class="card-info">
              <div class="info-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M8 4V8L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span>{{ service.processingTime }}</span>
              </div>
              <div class="info-item fee">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                  <text x="8" y="11" text-anchor="middle" font-size="8" fill="currentColor">₹</text>
                </svg>
                <span>₹{{ service.fee }}</span>
              </div>
            </div>

            <button 
              class="apply-btn"
              (click)="selectAndProceed(service); $event.stopPropagation()">
              <span>Apply Now</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredServices.length === 0">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#f3f4f6"/>
            <path d="M45 60H75M60 45V75" stroke="#9ca3af" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <h3>No Services Found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      </div>

      <!-- Application Form -->
      <div *ngIf="showDynamicForm" class="form-section">
        <div class="form-header">
          <button class="back-btn" (click)="backToServiceSelection()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Back to Services</span>
          </button>
          <div class="form-title">
            <h3>Application Form</h3>
            <p>{{ selectedService?.name }}</p>
          </div>
        </div>

        <app-dynamic-form
          [formSchema]="selectedService.formSchema"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="backToServiceSelection()">
        </app-dynamic-form>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .apply-service {
      min-height: 100vh;
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      padding: 2rem;
    }

    /* Modern Header */
    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      animation: fadeIn 0.6s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .header-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .header-icon {
      margin-bottom: 1.5rem;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #6366f1;
      margin-bottom: 0.5rem;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      font-weight: 500;
    }

    /* Alerts */
    .alert {
      max-width: 800px;
      margin: 0 auto 2rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
      animation: slideDown 0.4s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .alert-success {
      background: #ddd6fe;
      color: #5b21b6;
      border-left: 4px solid #6366f1;
    }

    .alert-danger {
      background: #fee2e2;
      color: #991b1b;
      border-left: 4px solid #dc2626;
    }

    /* Selection Container */
    .selection-container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .search-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-wrapper svg {
      position: absolute;
      left: 1rem;
      color: #9ca3af;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 3rem 0.875rem 3rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      background: white;
      transition: all 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .clear-search {
      position: absolute;
      right: 1rem;
      background: #e5e7eb;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.25rem;
      color: #6b7280;
      transition: all 0.2s;
    }

    .clear-search:hover {
      background: #6366f1;
      color: white;
    }

    .category-select {
      padding: 0.875rem 1.25rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      font-size: 1rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 200px;
    }

    .category-select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    /* Results Info */
    .results-info {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .count {
      color: #6b7280;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Services Grid */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .service-card {
      background: white;
      border-radius: 16px;
      padding: 1.75rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transform: scaleX(0);
      transition: transform 0.3s;
    }

    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15);
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card.selected {
      border-color: #6366f1;
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
    }

    .service-card.selected::before {
      transform: scaleX(1);
    }

    .card-badge {
      display: inline-block;
      background: #ddd6fe;
      color: #5b21b6;
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }

    .card-description {
      color: #6b7280;
      font-size: 0.9375rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
      min-height: 60px;
    }

    .card-info {
      display: flex;
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-bottom: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .info-item svg {
      color: #9ca3af;
    }

    .info-item.fee {
      color: #6366f1;
    }

    .info-item.fee svg {
      color: #6366f1;
    }

    .apply-btn {
      width: 100%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 0.875rem 1.5rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s;
      margin-top: 1rem;
    }

    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
    }

    .apply-btn svg {
      transition: transform 0.3s;
    }

    .apply-btn:hover svg {
      transform: translateX(4px);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
    }

    .empty-state svg {
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
    }

    /* Form Section */
    .form-section {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      animation: fadeIn 0.5s ease;
    }

    .form-header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .back-btn {
      background: #f3f4f6;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      color: #374151;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      transition: all 0.3s;
    }

    .back-btn:hover {
      background: #e5e7eb;
    }

    .form-title h3 {
      font-size: 1.75rem;
      color: #111827;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .form-title p {
      color: #6366f1;
      font-weight: 600;
      font-size: 1.125rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .apply-service {
        padding: 1rem;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .filter-bar {
        flex-direction: column;
      }

      .category-select {
        min-width: 100%;
      }

      .services-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ApplyServiceComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicFormComponent!: DynamicFormComponent;

  services: any[] = [];
  filteredServices: any[] = [];
  categories: string[] = [];
  selectedServiceId = '';
  selectedService: any = null;
  showDynamicForm = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';
  selectedCategory = '';

  constructor(
    private serviceService: ServiceService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.serviceService.getAllServices()
      .subscribe({
        next: (response) => {
          this.services = response.data.filter((s: any) => s.isActive);
          this.filteredServices = [...this.services];
          this.extractCategories();
        },
        error: (error) => {
          console.error('Error loading services:', error);
        }
      });
  }

  extractCategories(): void {
    const categorySet = new Set(this.services.map(s => s.category));
    this.categories = Array.from(categorySet).sort();
  }

  filterServices(): void {
    this.filteredServices = this.services.filter(service => {
      const matchesSearch = !this.searchTerm || 
        service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        service.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  selectService(service: any): void {
    this.selectedServiceId = service._id;
    this.selectedService = service;
  }

  selectAndProceed(service: any): void {
    this.selectedServiceId = service._id;
    this.selectedService = service;
    this.proceedToForm();
  }

  clearSelection(): void {
    this.selectedServiceId = '';
    this.selectedService = null;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Identity': '🆔',
      'License': '📜',
      'Certificate': '📋',
      'Permit': '✅',
      'Registration': '📝',
      'Taxation': '💵',
      'Legal': '⚖️',
      'Health': '🏥',
      'Education': '🎓',
      'Transport': '🚗',
      'Property': '🏠',
      'Welfare': '🤝'
    };
    return icons[category] || '📄';
  }

  proceedToForm(): void {
    if (!this.selectedService) return;
    
    // If no form schema defined, use basic submission
    if (!this.selectedService.formSchema || this.selectedService.formSchema.length === 0) {
      this.selectedService.formSchema = [{
        fieldName: 'additionalInfo',
        fieldLabel: 'Additional Information',
        fieldType: 'textarea',
        required: false,
        placeholder: 'Enter any additional details...',
        validation: {},
        order: 0
      }];
    }

    this.showDynamicForm = true;
  }

  backToServiceSelection(): void {
    this.showDynamicForm = false;
    this.clearSelection();
  }

  onFormSubmit(formData: any): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const applicationData = {
      serviceId: this.selectedServiceId,
      applicationData: formData
    };

    this.applicationService.createApplication(applicationData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          const applicationId = response.data._id;
          this.successMessage = 'Application submitted successfully! Redirecting to payment...';
          
          // Reset dynamic form
          if (this.dynamicFormComponent) {
            this.dynamicFormComponent.resetSubmitting();
          }

          setTimeout(() => {
            this.router.navigate(['/citizen/applications', applicationId]);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Failed to submit application.';
          
          // Reset dynamic form
          if (this.dynamicFormComponent) {
            this.dynamicFormComponent.resetSubmitting();
          }
        }
      });
  }
}
