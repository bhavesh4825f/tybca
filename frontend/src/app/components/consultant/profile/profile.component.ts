import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-consultant-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <div class="header">
          <h1>Profile</h1>
          <button class="btn-primary" *ngIf="!isEditing" (click)="startEdit()">Edit</button>
          <div class="edit-actions" *ngIf="isEditing">
            <button class="btn-primary" type="button" (click)="saveProfile()">Save</button>
            <button class="btn-ghost" type="button" (click)="cancelEdit()">Cancel</button>
          </div>
        </div>

        <div class="photo-row">
          <div class="photo">
            <img *ngIf="photoUrl; else placeholder" [src]="photoUrl" alt="Profile photo" />
            <ng-template #placeholder>
              <div class="photo-placeholder">{{ initials }}</div>
            </ng-template>
          </div>
          <label class="btn-secondary">
            Add / Change Photo
            <input type="file" accept="image/*" (change)="onPhotoChange($event)" hidden />
          </label>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" name="name" [(ngModel)]="profile.name" [readonly]="!isEditing" [class.readonly]="!isEditing" />
          </div>
          <div class="field">
            <label for="address">Address</label>
            <input id="address" name="address" [(ngModel)]="profile.address" [readonly]="!isEditing" [class.readonly]="!isEditing" />
          </div>
          <div class="field">
            <label for="phone">Mobile Number</label>
            <input id="phone" name="phone" [(ngModel)]="profile.phone" [readonly]="!isEditing" [class.readonly]="!isEditing" />
          </div>
          <div class="field">
            <label for="email">Email ID</label>
            <input id="email" name="email" type="email" [(ngModel)]="profile.email" [readonly]="!isEditing" [class.readonly]="!isEditing" />
          </div>
        </div>

        <div class="section-divider"></div>

        <div class="password-section">
          <h2>Change Password</h2>
          <div class="form-grid">
            <div class="field">
              <label for="currentPassword">Current Password</label>
              <input id="currentPassword" name="currentPassword" type="password" [(ngModel)]="password.current" />
            </div>
            <div class="field">
              <label for="newPassword">New Password</label>
              <input id="newPassword" name="newPassword" type="password" [(ngModel)]="password.next" />
            </div>
            <div class="field">
              <label for="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" [(ngModel)]="password.confirm" />
            </div>
          </div>
          <button class="btn-primary" type="button" (click)="changePassword()">Change Password</button>
          <p class="message" *ngIf="passwordMessage">{{ passwordMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .profile-page {
      min-height: 100vh;
      padding: 32px 16px 48px;
      background: #f3f4f6;
    }

    .profile-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .edit-actions {
      display: flex;
      gap: 12px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
    }

    .btn-ghost {
      background: transparent;
      color: #64748b;
      border: 2px solid #e2e8f0;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
    }

    .btn-ghost:hover {
      background: #f8fafc;
      color: #334155;
      border-color: #cbd5e1;
    }

    .btn-secondary {
      background: #f8fafc;
      color: #059669;
      border: 2px solid #e2e8f0;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
      display: inline-block;
    }

    .btn-secondary:hover {
      background: #f0fdf4;
      border-color: #059669;
    }

    .photo-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 12px;
      border: 1px solid #bbf7d0;
    }

    .photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 16px rgba(5, 150, 105, 0.15);
      flex-shrink: 0;
    }

    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #475569;
    }

    .field input {
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;
      background: white;
      color: #1e293b;
      font-family: inherit;
    }

    .field input:focus {
      outline: none;
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    .field input.readonly {
      background: #f8fafc;
      color: #64748b;
      cursor: not-allowed;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 8px 0;
    }

    .password-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .password-section h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .message {
      padding: 12px 16px;
      background: #dbeafe;
      border: 1px solid #93c5fd;
      border-radius: 10px;
      color: #1e40af;
      font-size: 0.95rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .profile-page {
        padding: 20px 12px;
      }

      .profile-card {
        padding: 20px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .edit-actions {
        flex-direction: column;
      }

      .photo-row {
        flex-direction: column;
        text-align: center;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConsultantProfileComponent implements OnInit {
  currentUser: any;
  isEditing = false;
  photoUrl: string | ArrayBuffer | null = null;
  photoFile: File | null = null;
  passwordMessage = '';

  profile = {
    name: '',
    address: '',
    phone: '',
    email: ''
  };

  savedProfile = {
    name: '',
    address: '',
    phone: '',
    email: ''
  };

  password = {
    current: '',
    next: '',
    confirm: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Refresh user data from localStorage to get latest updates
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.authService['currentUserSubject'].next(this.currentUser);
    } else {
      this.currentUser = this.authService.getCurrentUser();
    }
    
    this.profile = {
      name: this.currentUser?.name || '',
      address: this.currentUser?.address || '',
      phone: this.currentUser?.phone || '',
      email: this.currentUser?.email || ''
    };
    this.savedProfile = { ...this.profile };
    
    // Load existing profile photo if available
    if (this.currentUser?.profilePhoto) {
      this.photoUrl = `${environment.baseUrl}/${this.currentUser.profilePhoto}`;
    }
  }

  get initials(): string {
    const value = this.profile.name || this.currentUser?.name || 'U';
    const parts = value.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0]?.toUpperCase() || 'U';
  }

  startEdit(): void {
    this.isEditing = true;
    this.passwordMessage = '';
  }

  saveProfile(): void {
    // Save profile data to backend
    const profileData = {
      name: this.profile.name,
      address: this.profile.address,
      phone: this.profile.phone
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        if (response.success) {
          this.savedProfile = { ...this.profile };
          this.isEditing = false;
          // Update current user reference
          this.currentUser = this.authService.getCurrentUser();
          alert('Profile updated successfully!');
        }
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.profile = { ...this.savedProfile };
    this.isEditing = false;
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    this.photoFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      this.photoUrl = reader.result;
    };
    reader.readAsDataURL(file);

    // Upload to backend immediately
    this.authService.uploadProfilePhoto(file).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Profile photo uploaded successfully');
          // Update current user reference to get the new photo path
          this.currentUser = this.authService.getCurrentUser();
          // Update photoUrl with the actual backend path
          if (response.photoUrl) {
            this.photoUrl = `${environment.baseUrl}/${response.photoUrl}`;
          } else if (this.currentUser?.profilePhoto) {
            this.photoUrl = `${environment.baseUrl}/${this.currentUser.profilePhoto}`;
          }
          alert('Profile photo updated!');
        }
      },
      error: (err) => {
        console.error('Error uploading photo:', err);
        alert('Failed to upload photo. Please try again.');
        // Revert to previous photo if upload fails
        if (this.currentUser?.profilePhoto) {
          this.photoUrl = `${environment.baseUrl}/${this.currentUser.profilePhoto}`;
        } else {
          this.photoUrl = null;
        }
      }
    });
  }

  changePassword(): void {
    if (!this.password.current || !this.password.next || !this.password.confirm) {
      this.passwordMessage = 'Please fill all password fields.';
      return;
    }
    if (this.password.next !== this.password.confirm) {
      this.passwordMessage = 'New password and confirm password do not match.';
      return;
    }

    // Call backend to change password
    this.authService.changePassword(this.password.current, this.password.next).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordMessage = 'Password changed successfully!';
          this.password = { current: '', next: '', confirm: '' };
        }
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.passwordMessage = err.error?.message || 'Failed to change password. Please try again.';
      }
    });
  }
}
