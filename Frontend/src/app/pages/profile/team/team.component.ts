import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule  } from '@angular/router';
import { TeamMember, UsersService } from 'src/app/service/users.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule,
    CommonModule
  ]
})
export class TeamComponent implements OnInit {
  usersService = inject(UsersService);
  teamMembers: TeamMember[] = [];
  router = inject(Router);

  ngOnInit(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.teamMembers = users.teamMembers;
      }
    })
  }

  navigateToStatisticPage(member: TeamMember) {
    this.router.navigate(['/statistic'], {
      state: { member: member }
    });
  }
}
