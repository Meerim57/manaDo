import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule  } from '@angular/router';
import { UsersService } from 'src/app/service/users.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule
  ]
})
export class TeamComponent implements OnInit {
  usersService = inject(UsersService);

  ngOnInit(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => console.log(users)
    })
  }
}
