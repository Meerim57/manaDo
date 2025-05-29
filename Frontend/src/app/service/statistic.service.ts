import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Statistics {
  completed_tasks: {
    count: number;
    tasks: any[];
  };
  overdue_tasks: {
    count: number;
    tasks: any[];
  };
  total_tasks: number;
  completion_rate: number;
}

export interface StatisticsResponse {
  status: string;
  statistics: Statistics;
}


@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private apiUrl = 'http://localhost:8000/User/statistic.php';

  constructor(private http: HttpClient) { }

  getUserStatistics(userId: number): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.apiUrl}?user_id=${userId}`);
  }
}
