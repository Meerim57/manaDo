import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

interface User {
  id: number;
  email: string;
}

interface RegisterResponse {
  id: number;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/User/authorization.php'; // Упрощенный путь
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) { }

  register(email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      this.apiUrl, 
      { email, password },
      { headers: this.headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(this.apiUrl, { 
      headers: this.headers,
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<User> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<User>(this.apiUrl, { 
      headers: this.headers,
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Unknown error';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}