import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ticketInfo, TicketService, UserTicketInfo } from 'src/app/service/ticket.service';
import { Ticket } from '../layout/nav-bar-dialog/nav-bar-dialog.component';
import { UsersService } from 'src/app/service/users.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag
  ]
})
export class BoardComponent implements OnInit {
  private dialog = inject(MatDialog);
  private ticketService = inject(TicketService);
  private userService = inject(UsersService);
  private route = inject(ActivatedRoute);
  
  newTickets: Ticket[] = [];
  inProgressTickets: Ticket[] = [];
  completedTickets: Ticket[] = [];
  expiredTickets: Ticket[] = [];
  connectedDropLists: string[] = ['list-new', 'list-in-progress', 'list-completed', 'list-expired'];
  selectedUserId: number | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedUserId = params['userId'] ? Number(params['userId']) : this.userService.userId();
      this.loadTickets();
    });
  }

  private loadTickets() {
    if (this.selectedUserId) {
      this.ticketService.getUserTickets(this.selectedUserId).subscribe({
        next: (data: UserTicketInfo) => {
          console.log('Received tickets:', data.user_tickets);
          this.newTickets = data.user_tickets.filter(ticket => ticket.status === 'Новое');
          this.inProgressTickets = data.user_tickets.filter(ticket => ticket.status === 'В работе');
          this.completedTickets = data.user_tickets.filter(ticket => ticket.status === 'Завершено');
          this.expiredTickets = data.user_tickets.filter(ticket => new Date(ticket.deadline) < new Date());
        },
        error: (error) => {
          console.error('Error fetching tickets:', error);
        }
      });
    }
  }

  drop(event: CdkDragDrop<Ticket[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      
      let newStatus: string;
      switch (event.container.id) {
        case 'list-new':
          newStatus = 'Новое';
          break;
        case 'list-in-progress':
          newStatus = 'В работе';
          break;
        case 'list-completed':
          newStatus = 'Завершено';
          break;
        default:
          newStatus = movedTask.status;
      }

      this.ticketService.updateTicket(movedTask.id!, { status: newStatus }).subscribe({
        next: () => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        },
        error: (err) => {
          console.error('Ошибка при обновлении задачи:', err);
        }
      });
    }
  }

  openTaskDialog(task: Ticket) {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Обработка результата
      }
    });
  }
}