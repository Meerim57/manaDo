import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar-dialog',
  templateUrl: './nav-bar-dialog.component.html',
  styleUrls: ['./nav-bar-dialog.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class NavBarDialogComponent {
  statuses = [
    'Новое',
    'В работе',
    'Закончено'
  ]

  taskForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NavBarDialogComponent>, 
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      name: [''],
      status: [''],
      description: [''],
      assignee: [''],
      reporter: ['']
    });
  }

  close() {
    this.dialogRef.close();
  }

  cancel(): void {
    this.taskForm.reset();
  }

  create(): void {
    if (this.taskForm.valid) {
      console.log('Создана задача:', this.taskForm.value);
      this.close();
    }
  }
}
