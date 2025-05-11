import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Ticket } from '../pages/layout/nav-bar-dialog/nav-bar-dialog.component';
import { catchError, Observable, throwError } from 'rxjs';

export interface ticketCreated {
  status: string;       
  message: string;      
  task_id: number;    
}

export interface ticketInfo {
  status: string;       
  tasks: Ticket[];  
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8000/Tasks/create_ticket.php';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) { }

  createTicket(ticket : Ticket): Observable<ticketCreated> {
    console.log(ticket);
    return this.http.post<ticketCreated>(
      this.apiUrl, 
      { ticket },
      { headers: this.headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getTickets(): Observable<ticketInfo> {
    return this.http.get<ticketInfo>(
      this.apiUrl
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
