import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TeamMember, UsersService } from 'src/app/service/users.service';
import { TicketService } from 'src/app/service/ticket.service';

export interface Ticket {
  id?: number;
  name: string;
  status: string;
  description: string;
  assignee: string;
  deadline: string;
}

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
export class NavBarDialogComponent implements OnInit {
  userService = inject(UsersService);
  ticketService = inject(TicketService);
  teamMember: TeamMember[] = [];

  statuses = [
    'Новое',
    'В работе',
    'Закончено'
  ]

  //teamMembers: string[];

  taskForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NavBarDialogComponent>, 
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      name: '',
      status: '',
      description: '',
      assignee: '',
      deadline: ''
    });
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log(users);
        this.teamMember = users.teamMembers;
      }
    })
  }

  close() {
    this.dialogRef.close();
  }

  cancel(): void {
    this.taskForm.reset();
  }

  create(): void {
    const createdTicket = {
      name: this.taskForm.value.name,
      status: this.taskForm.value.status,
      description: this.taskForm.value.description,
      assignee: this.taskForm.value.assignee,
      deadline: this.taskForm.value.deadline,
    }

    console.log(createdTicket);

    if (this.taskForm.valid) {
      this.ticketService.createTicket(createdTicket).subscribe({
        next: () => console.log('success')
      })
      this.close();
    }
  }
}
