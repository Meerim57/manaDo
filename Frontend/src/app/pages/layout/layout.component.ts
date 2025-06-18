import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { UsersService } from 'src/app/service/users.service';
import { NavBarDialogComponent } from './nav-bar-dialog/nav-bar-dialog.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ]
})
export class LayoutComponent implements OnInit {
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private userService = inject(UsersService);
  userInfo = this.authService.userInfo;

  ngOnInit() {
    this.authService.getUserById(this.userService.userId()).subscribe({
      next: (data) => {
        this.userInfo.set(data.user);
      },
      error: () => {
        console.log('error');
      }
    });
  }

  openDialog() {
    this.dialog.open(NavBarDialogComponent, {
      panelClass: 'custom-dialog-panel'
    });
  }
}
