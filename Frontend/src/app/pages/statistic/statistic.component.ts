import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.css'],
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule
  ]
})
export class StatisticComponent {

}
