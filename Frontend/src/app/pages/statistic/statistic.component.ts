import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TeamMember } from 'src/app/service/users.service';

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
export class StatisticComponent implements OnInit {
  memberData: TeamMember;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.memberData = navigation?.extras.state?.['member'];
  }

  ngOnInit(): void {
    console.log(this.memberData);
  }
  

}
