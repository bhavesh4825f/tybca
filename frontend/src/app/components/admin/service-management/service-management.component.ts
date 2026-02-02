import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="service-management">
      <h2>Service Management</h2>

      <button class="btn btn-primary" (click)="createService()" style="margin-bottom: 20px;">Add New Service</button>

      <div *ngIf="loading" class="spinner"></div>

      <div *ngIf="!loading" class="card">
        <table>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Category</th>
              <th>Fee</th>
              <th>Processing Time</th>
              <th>Form Fields</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let service of services">
              <td>{{ service.name }}</td>
              <td>{{ service.category }}</td>
              <td>₹{{ service.fee }}</td>
              <td>{{ service.processingTime }}</td>
              <td>
                <span class="badge badge-info">{{ service.formSchema?.length || 0 }} fields</span>
              </td>
              <td>
                <span [class]="service.isActive ? 'badge-success' : 'badge-danger'" class="badge">
                  {{ service.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="editService(service._id)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="deleteService(service._id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .service-management h2 {
      margin-bottom: 20px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      margin-right: 5px;
    }
  `]
})
export class ServiceManagementComponent implements OnInit {
  services: any[] = [];
  loading = false;

  constructor(
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getAllServices()
      .subscribe({
        next: (response) => {
          this.services = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.loading = false;
        }
      });
  }

  createService(): void {
    this.router.navigate(['/admin/service-builder']);
  }

  editService(id: string): void {
    this.router.navigate(['/admin/service-builder', id]);
  }

  deleteService(id: string): void {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    this.serviceService.deleteService(id).subscribe({
      next: () => {
        alert('Service deleted successfully!');
        this.loadServices();
      },
      error: (error: any) => {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
      }
    });
  }
}
