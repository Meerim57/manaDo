import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/Backend/User/authorization.php';

  constructor(private http: HttpClient) { }

  register(email: string, password: string) {
    return this.http.post(this.apiUrl, { email, password });
  }

  getUserByEmail(email: string) {
    return this.http.get(this.apiUrl + '?email=' + encodeURIComponent(email));
  }

  getUserById(id: number) {
    return this.http.get(this.apiUrl + '?id=' + id);
  }
}
