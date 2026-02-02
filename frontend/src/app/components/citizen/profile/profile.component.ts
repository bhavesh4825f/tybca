import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
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
      flex-wrap: wrap;
    }

    .header h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #111827;
    }

    .photo-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .photo {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
    }

    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-placeholder {
      font-size: 1.4rem;
      font-weight: 700;
      color: #6366f1;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #374151;
    }

    input {
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-size: 0.95rem;
      transition: border 0.2s ease, box-shadow 0.2s ease;
    }

    input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    input.readonly {
      background: #f9fafb;
      color: #6b7280;
    }

    .section-divider {
      height: 1px;
      background: #e5e7eb;
    }

    .password-section h2 {
      margin: 0 0 12px;
      font-size: 1.2rem;
      font-weight: 700;
      color: #111827;
    }

    .btn-primary {
      background: #6366f1;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-secondary {
      border: 1px solid #6366f1;
      color: #6366f1;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-ghost {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .edit-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .message {
      margin: 8px 0 0;
      color: #16a34a;
      font-weight: 600;
    }

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  isEditing = false;
  photoUrl: string | ArrayBuffer | null = null;
  passwordMessage = '';
  photoFile: File | null = null;

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
