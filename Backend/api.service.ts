import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  register(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/user/authorization`, { email, password });
  }

  getUser(id: string) {
    return this.http.get(`${this.apiUrl}/user/authorization?id=${id}`);
  }
}