import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Application {
  _id: string;
  applicationNumber: string;
  citizen: any;
  service: any;
  status: string;
  documents: any[];
  remarks: any[];
  submittedAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Citizen APIs
  getMyApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/citizen/applications`);
  }

  createApplication(applicationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/citizen/applications`, applicationData);
  }

  getApplicationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/citizen/applications/${id}`);
  }

  uploadDocuments(applicationId: string, files: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/citizen/applications/${applicationId}/documents`, files);
  }

  // Employee APIs
  getAssignedApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee/applications`);
  }

  updateApplicationStatus(applicationId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee/applications/${applicationId}/status`, { status });
  }

  addRemark(applicationId: string, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee/applications/${applicationId}/remarks`, { comment });
  }

  // Admin APIs
  getAllApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/applications`);
  }

  assignApplication(applicationId: string, employeeId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/applications/${applicationId}/assign`, { employeeId });
  }

  // Search
  searchApplications(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/search`, { params });
  }
}
