import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  columns = [
    {
      title: 'Новое',
      tasks: [
        { name: 'Создать макет', fromWhom: 'Ивана Иванова'},
        { name: 'Собрать требования', fromWhom: 'Андрея Андреева'}
      ]
    },
    {
      title: 'В процессе',
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
}
