import { Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  private dialog = inject(MatDialog);

  columns = [
    {
      title: 'Новое',
      tasks: [
        { name: 'Создать макет', fromWhom: 'Ивана Иванова'},
        { name: 'Собрать требования', fromWhom: 'Андрея Андреева'}
      ]
    },
    {
      title: 'В работе',
      tasks: [
        { name: 'Реализация авторизации', fromWhom: 'Александра Александровича'}
      ]
    },
    {
      title: 'Закончено',
      tasks: [
        { name: 'Настроить окружение', fromWhom: 'Ивана Иванова'}
      ]
    }
  ];

  connectedDropLists: string[] = [];

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  ngOnInit() {
    this.connectedDropLists = this.columns.map((_, index) => 'list-' + index);
  }

  openTaskDialog(task: any) {
    this.dialog.open(TaskDialogComponent, {
      data: task,
      panelClass: 'custom-dialog-panel'
    });
  }
}
