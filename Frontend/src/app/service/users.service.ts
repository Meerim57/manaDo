import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { UserInfo } from '../pages/profile/person-info/person-info.component';

export interface userInfo {
    status: string;          
    teamMembers: TeamMember[];
}

export interface TeamMember {
  id: number;              
  personData: {            
    firstName: string;           
    lastName: string;      
    email: string;         
    position: string;     
    stack: string;          
  }
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
  private apiUrl = 'http://localhost:8000/User/person.php';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  userId = signal<number>(0);

  constructor(private http: HttpClient) { }

  getUsers(): Observable<userInfo> {
    return this.http.get<userInfo>(
      this.apiUrl
    )
  }

  sendUserInfo(userInfo: UserInfo): Observable<UserSended> {
    return this.http.post<UserSended>(
      this.apiUrl,
      { userInfo },
      { headers: this.headers }
    ).pipe(
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
