import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="employee-container">
      <div class="header">
        <h2>Employee Management</h2>
        <button class="btn-add" (click)="showAddForm = true">+ Add Employee</button>
      </div>

      <!-- Add/Edit Employee Form -->
      <div class="form-modal" *ngIf="showAddForm || editingEmployee">
        <div class="modal-content">
          <h3>{{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}</h3>
          <form (ngSubmit)="saveEmployee()">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="employeeForm.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="employeeForm.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Phone *</label>
              <input type="tel" [(ngModel)]="employeeForm.phone" name="phone" required>
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea [(ngModel)]="employeeForm.address" name="address" rows="3"></textarea>
            </div>
            <div class="form-group" *ngIf="!editingEmployee">
              <label>Password *</label>
              <input type="password" [(ngModel)]="employeeForm.password" name="password" [required]="!editingEmployee">
            </div>
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="employeeForm.role" name="role" required>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-save">{{ editingEmployee ? 'Update' : 'Create' }}</button>
              <button type="button" class="btn-cancel" (click)="cancelForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Employees List -->
      <div class="employees-grid">
        <div class="employee-card" *ngFor="let employee of employees">
          <div class="employee-header">
            <h3>{{ employee.name }}</h3>
            <span class="role-badge" [class.admin]="employee.role === 'admin'">
              {{ employee.role }}
            </span>
          </div>
          <div class="employee-info">
            <p><strong>Email:</strong> {{ employee.email }}</p>
            <p><strong>Phone:</strong> {{ employee.phone }}</p>
            <p *ngIf="employee.address"><strong>Address:</strong> {{ employee.address }}</p>
            <p><strong>Joined:</strong> {{ employee.createdAt | date:'mediumDate' }}</p>
          </div>
          <div class="employee-stats" *ngIf="employee.role === 'employee'">
            <div class="stat-item">
              <span class="stat-value">{{ employee.assignedApplications || 0 }}</span>
              <span class="stat-label">Assigned</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ employee.completedApplications || 0 }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="employee-actions">
            <button class="btn-edit" (click)="editEmployee(employee)">Edit</button>
            <button class="btn-delete" (click)="deleteEmployee(employee._id)">Delete</button>
          </div>
        </div>
      </div>

      <p class="no-data" *ngIf="employees.length === 0">No employees found. Add your first employee!</p>
    </div>
  `,
  styles: [`
    .employee-container {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h2 {
      color: #333;
      font-size: 2rem;
    }

    .btn-add {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: transform 0.3s;
    }

    .btn-add:hover {
      transform: translateY(-2px);
    }

    .form-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #666;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-save {
      flex: 1;
      background: #28a745;
      color: white;
      border: none;
      padding: 0.8rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-cancel {
      flex: 1;
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.8rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
    }

    .employees-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .employee-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .employee-card:hover {
      transform: translateY(-5px);
    }

    .employee-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .employee-header h3 {
      color: #333;
      margin: 0;
    }

    .role-badge {
      background: #667eea;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.admin {
      background: #dc3545;
    }

    .employee-info {
      margin-bottom: 1rem;
    }

    .employee-info p {
      margin: 0.5rem 0;
      color: #666;
    }

    .employee-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 5px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      display: block;
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .employee-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-edit {
      flex: 1;
      background: #007bff;
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-edit:hover {
      background: #0056b3;
    }

    .btn-delete {
      flex: 1;
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.6rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-delete:hover {
      background: #c82333;
    }

    .no-data {
      text-align: center;
      color: #999;
      font-size: 1.2rem;
      padding: 3rem;
    }
  `]
})
export class EmployeeManagementComponent implements OnInit {
  employees: any[] = [];
  showAddForm = false;
  editingEmployee: any = null;
  employeeForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'employee'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (response) => {
        this.employees = response.data.filter((user: any) => 
          user.role === 'employee' || user.role === 'admin'
        );
        // Load stats for employees
        this.loadEmployeeStats();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  loadEmployeeStats(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/applications`).subscribe({
      next: (response) => {
        const applications = response.data;
        this.employees = this.employees.map(emp => {
          if (emp.role === 'employee') {
            emp.assignedApplications = applications.filter((app: any) => 
              app.assignedTo?._id === emp._id && 
              ['Submitted', 'Under Review', 'Pending Documents'].includes(app.status)
            ).length;
            emp.completedApplications = applications.filter((app: any) => 
              app.assignedTo?._id === emp._id && 
              app.status === 'Completed'
            ).length;
          }
          return emp;
        });
      },
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  saveEmployee(): void {
    if (this.editingEmployee) {
      // Update existing employee
      const { password, ...updateData } = this.employeeForm;
      this.http.put<any>(
        `${environment.apiUrl}/admin/users/${this.editingEmployee._id}`,
        updateData
      ).subscribe({
        next: (response) => {
          alert('Employee updated successfully!');
          this.cancelForm();
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          alert('Failed to update employee');
        }
      });
    } else {
      // Create new employee
      // Validate required fields
      if (!this.employeeForm.name || !this.employeeForm.email || 
          !this.employeeForm.phone || !this.employeeForm.password) {
        alert('Please fill in all required fields (Name, Email, Phone, Password)');
        return;
      }

      const employeeData = {
        name: this.employeeForm.name,
        email: this.employeeForm.email,
        phone: this.employeeForm.phone,
        password: this.employeeForm.password,
        role: this.employeeForm.role,
        address: this.employeeForm.address || undefined
      };

      this.http.post<any>(
        `${environment.apiUrl}/admin/users`,
        employeeData
      ).subscribe({
        next: (response) => {
          alert('Employee created successfully!');
          this.cancelForm();
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error creating employee:', error);
          const errorMsg = error.error?.message || error.error?.errors?.join(', ') || 'Failed to create employee';
          alert(errorMsg);
        }
      });
    }
  }

  editEmployee(employee: any): void {
    this.editingEmployee = employee;
    this.employeeForm = {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      address: employee.address || '',
      password: '',
      role: employee.role
    };
  }

  deleteEmployee(id: string): void {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    this.http.delete<any>(`${environment.apiUrl}/admin/users/${id}`).subscribe({
      next: (response) => {
        alert('Employee deleted successfully!');
        this.loadEmployees();
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee');
      }
    });
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingEmployee = null;
    this.employeeForm = {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      role: 'employee'
    };
  }
}
