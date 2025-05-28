import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken();
    
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.authService.checkToken(token).pipe(
      map(response => {
        if (response.status === 'success') {
          return true;
        }
        this.authService.removeToken();
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        this.authService.removeToken();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}