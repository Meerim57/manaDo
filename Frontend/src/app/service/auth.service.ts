import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

interface User {
  id: number;
  email: string;
  password: string;
}

export interface UserInfo {
  status: string;
  user: UserFullInfo;
}

export interface UserFullInfo {
  id: number;
  email: string;
  stack: string;
  lastName: string;
  position: string;
  firstName: string;
}

interface RegisterResponse {
  id: number;
  email: string;
}

interface LoginResponse {
  status: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/User/authorization.php';
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

  login(email: string, password: string): Observable<LoginResponse> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http.get<LoginResponse>(this.apiUrl, { params });
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

  getUserById(id: number): Observable<UserInfo> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<UserInfo>(this.apiUrl, { 
      headers: this.headers,
      params 
    }).pipe(
      catchError(this.handleError)
    );
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  checkToken(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get<any>(this.apiUrl, { params });
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Unknown error';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}