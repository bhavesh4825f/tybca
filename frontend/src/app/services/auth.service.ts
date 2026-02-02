import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: any;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: {
    user: User;
    token?: string;
  };
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
        console.log('User loaded from localStorage on app start');
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response);
          }
        })
      );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response);
          }
        })
      );
  }

  private setSession(authResult: AuthResponse): void {
    const user = authResult.data?.user || authResult.user;
    const token = authResult.data?.token || authResult.token;
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
      console.log('User saved to localStorage:', user);
    }
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, profileData)
      .pipe(
        tap((response: any) => {
          if (response.success && response.data) {
            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    
    return this.http.post<any>(`${this.apiUrl}/profile-photo`, formData)
      .pipe(
        tap((response: any) => {
          if (response.success && response.data) {
            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        })
      );
  }
}

