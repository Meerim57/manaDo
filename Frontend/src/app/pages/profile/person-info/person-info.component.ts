import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule  } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-person-info',
  templateUrl: './person-info.component.html',
  styleUrls: ['./person-info.component.css'],
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class PersonInfoComponent {
  profileForm: FormGroup;

  fields = [
    { label: 'Имя', controlName: 'firstName', type: 'text' },
    { label: 'Фамилия', controlName: 'lastName', type: 'text' },
    { label: 'Почта', controlName: 'email', type: 'email' },
    { label: 'Должность', controlName: 'occupation', type: 'text' },
    { label: 'Стэк', controlName: 'stack', type: 'text' }
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      occupation: [''],
      stack: ['']
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
    }
  }

  onCancel() {
    this.profileForm.reset();
  }
}
