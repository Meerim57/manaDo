import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule  } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface UserInfo {
  firstName: string,
  lastName: string,
  email: string,
  occupation: string,
  stack: string
}

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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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
      const userInfo = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        email: this.profileForm.value.email,
        occupation: this.profileForm.value.occupation,
        stack: this.profileForm.value.stack
      }

      console.log(userInfo);
    }
  }

  onCancel() {
    this.profileForm.reset();
  }

  openFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        console.log('Selected file:', file);
    }
}
}
