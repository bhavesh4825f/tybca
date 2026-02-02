import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  requiredDocuments: string[];
  processingTime: string;
  fee: number;
  isActive: boolean;
  eligibilityCriteria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getServiceById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createService(serviceData: any): Observable<any> {
    return this.http.post(this.apiUrl, serviceData);
  }

  updateService(id: string, serviceData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, serviceData);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
