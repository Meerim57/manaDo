import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamMember, UsersService } from 'src/app/service/users.service';

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
export class TeamComponent {
  private userService = inject(UsersService);
  private router = inject(Router);
  teamMembers: TeamMember[] = [];

  constructor() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.teamMembers = data.teamMembers;
      },
      error: () => {
        console.log('error');
      }
    });
  }

  navigateToStatisticPage(member: TeamMember) {
    this.router.navigate(['/statistic'], { state: { memberData: member } });
  }

  navigateToBoard(member: TeamMember) {
    this.router.navigate(['/board'], { queryParams: { userId: member.id } });
  }
}
