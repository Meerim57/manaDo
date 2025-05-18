import { Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { ticketInfo, TicketService } from 'src/app/service/ticket.service';
import { Ticket } from '../layout/nav-bar-dialog/nav-bar-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  private ticketService = inject(TicketService);
  private dialog = inject(MatDialog);

  newTickets: Ticket[] = [];
  inProgressTickets: Ticket[] = [];
  completedTickets: Ticket[] = [];
  expiredTickets: Ticket[] = [];

  connectedDropLists: string[] = ['list-new', 'list-in-progress', 'list-completed', 'list-expired'];

  ngOnInit() {
    this.loadTickets();

    this.ticketService.ticketsUpdated$.subscribe(() => {
      this.loadTickets();
    });
  }

  private loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (tickets: ticketInfo) => {
        console.log(tickets);
        this.distributeTickets(tickets.tasks);
      },
      error: () => console.log('error')
    });
  }

  distributeTickets(tickets: Ticket[]) {
    this.newTickets = tickets.filter(ticket => ticket.status === 'Новое');
    this.inProgressTickets = tickets.filter(ticket => ticket.status === 'В работе');
    this.completedTickets = tickets.filter(ticket => ticket.status === 'Закончено');
    this.expiredTickets = tickets.filter(ticket => new Date(ticket.deadline) < new Date());
  }

  drop(event: CdkDragDrop<any[]>) {
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
        default:
          newStatus = movedTask.status;
      }
  
      this.ticketService.updateTicket(movedTask.id, { status: newStatus }).subscribe({
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

  openTaskDialog(task: any) {
    this.dialog.open(TaskDialogComponent, {
      data: task,
      panelClass: 'custom-dialog-panel'
    });
  }
}