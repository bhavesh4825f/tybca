import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-management">
      <div class="header">
        <h2>Citizen Management</h2>
        <button class="btn-add" (click)="showAddForm = true">+ Add Citizen</button>
      </div>

      <div *ngIf="loading" class="spinner">Loading...</div>

      <!-- Add/Edit Form Modal -->
      <div class="form-modal" *ngIf="showAddForm">
        <div class="modal-content">
          <h3>{{ editingUser ? 'Edit Citizen' : 'Add New Citizen' }}</h3>
          <form (ngSubmit)="saveUser()">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="userForm.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="userForm.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="userForm.phone" name="phone">
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" [(ngModel)]="userForm.address" name="address">
            </div>
            <div class="form-group" *ngIf="!editingUser">
              <label>Password *</label>
              <input type="password" [(ngModel)]="userForm.password" name="password" [required]="!editingUser">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-save">{{ editingUser ? 'Update' : 'Create' }}</button>
              <button type="button" class="btn-cancel" (click)="cancelForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="!loading" class="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ user.phone || 'N/A' }}</td>
              <td>{{ user.address || 'N/A' }}</td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="editUser(user)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="deleteUser(user._id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="no-data" *ngIf="users.length === 0">No citizens found.</p>
      </div>
    </div>
  `,
  styles: [`
    .user-management {
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
      margin: 0;
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

    .spinner {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #666;
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

    .card {
      background: white;
      border-radius: 10px;
      padding: 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    .badge {
      background: #667eea;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.admin {
      background: #dc3545;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      margin-right: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .btn-sm:hover {
      opacity: 0.8;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-size: 1.1rem;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading = false;
  showAddForm = false;
  editingUser: any = null;
  userForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'citizen'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers()
      .subscribe({
        next: (response) => {
          // Filter to show only citizens
          this.users = response.data.filter((user: any) => 
            user.role === 'citizen'
          );
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.loading = false;
        }
      });
  }

  editUser(user: any): void {
    this.editingUser = user;
    this.userForm = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      password: '',
      role: user.role
    };
    this.showAddForm = true;
  }

  saveUser(): void {
    if (this.editingUser) {
      // Update existing user
      this.adminService.updateUser(this.editingUser._id, this.userForm)
        .subscribe({
          next: () => {
            alert('User updated successfully!');
            this.cancelForm();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            alert('Failed to update user');
          }
        });
    } else {
      // Create new user
      this.adminService.createUser(this.userForm)
        .subscribe({
          next: () => {
            alert('User created successfully!');
            this.cancelForm();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            alert('Failed to create user');
          }
        });
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId)
        .subscribe({
          next: () => {
            alert('User deleted successfully!');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
          }
        });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingUser = null;
    this.userForm = {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      role: 'citizen'
    };
  }
}
