import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavBarDialogComponent } from './nav-bar-dialog/nav-bar-dialog.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  private dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(NavBarDialogComponent, {
      panelClass: 'custom-dialog-panel'
    });
  }
}
