import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenKey = 'auth_token';
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Запускаем обновление токена каждую минуту
    timer(0, 60000).pipe(
      switchMap(() => this.refreshToken())
    ).subscribe();
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.tokenSubject.next(null);
  }

  private refreshToken(): Observable<any> {
    const currentToken = this.getToken();
    if (!currentToken) {
      return new Observable();
    }

    return this.http.get('http://localhost:8000/User/authorization.php', {
      params: { token: currentToken }
    }).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          // Если токен валиден, оставляем текущий
          return;
        } else {
          // Если токен невалиден, удаляем его
          this.removeToken();
        }
      })
    );
  }
} 