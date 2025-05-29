import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Statistics, StatisticService } from 'src/app/service/statistic.service';
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
  statistics!: Statistics;

  constructor(private router: Router, private statisticService: StatisticService) {
    const navigation = this.router.getCurrentNavigation();
    this.memberData = navigation?.extras.state?.['member'];
  }

  ngOnInit(): void {
    console.log(this.memberData);

    this.statisticService.getUserStatistics(this.memberData.id).subscribe((response) => {
      this.statistics = response.statistics;
    });
  }
  

}
