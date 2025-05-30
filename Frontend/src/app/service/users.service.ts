import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenService } from './token.service';

export interface TeamMember {
  id: number;
  personData: {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    stack: string[];
  }
}

export interface userInfo {
  status: string;
  teamMembers: TeamMember[];
}

export interface UserSended {
  status: string,
  message: string,
  person_id: number
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8000/User';
  private userIdSubject = new BehaviorSubject<number | null>(null);
  public userId$ = this.userIdSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Проверяем наличие токена при инициализации
    const token = this.tokenService.getToken();
    if (token) {
      this.validateToken(token);
    }
  }

  private validateToken(token: string): void {
    this.http.get(`${this.apiUrl}/authorization.php`, {
      params: { token }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.user) {
          this.userIdSubject.next(response.user.id);
        } else {
          this.tokenService.removeToken();
          this.userIdSubject.next(null);
        }
      },
      error: () => {
        this.tokenService.removeToken();
        this.userIdSubject.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/authorization.php`, {
      params: { email, password }
    }).pipe(
      tap((response: any) => {
        if (response.status === 'success' && response.token) {
          this.tokenService.setToken(response.token);
          this.userIdSubject.next(response.user.id);
        }
      })
    );
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/authorization.php`, {
      email,
      password
    });
  }

  getUsers(): Observable<userInfo> {
    return this.http.get<userInfo>(`${this.apiUrl}/person.php`);
  }

  updateUserInfo(userInfo: any): Observable<UserSended> {
    return this.http.post<UserSended>(`${this.apiUrl}/person.php`, {
      userInfo
    });
  }

  userId(): number | null {
    return this.userIdSubject.value;
  }

  logout(): void {
    this.tokenService.removeToken();
    this.userIdSubject.next(null);
  }
}
