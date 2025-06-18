import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule  } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from 'src/app/service/users.service';
import { AuthService, UserFullInfo } from 'src/app/service/auth.service';
import { HttpClient } from '@angular/common/http';

export interface UserInfo {
  firstName: string,
  lastName: string,
  email: string,
  position: string,
  stack: string
}

type FieldType = {
  label: string;
  controlName: keyof UserFullInfo; 
  type: string;
};

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
export class PersonInfoComponent implements OnInit {
  userService = inject(UsersService);
  authService = inject(AuthService);
  userInfo = signal<UserFullInfo | null>(null);
  profileForm: FormGroup;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  http = inject(HttpClient);

  
  fields: FieldType[] = [
    { label: 'Имя', controlName: 'firstName', type: 'text' },
    { label: 'Фамилия', controlName: 'lastName', type: 'text' },
    { label: 'Почта', controlName: 'email', type: 'email' },
    { label: 'Должность', controlName: 'position', type: 'text' },
    { label: 'Стэк', controlName: 'stack', type: 'text' }
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      position: [''],
      stack: ['']
    });
  }

  ngOnInit(): void {
    this.authService.getUserById(this.userService.userId()).subscribe({
      next: (data) => {
        this.userInfo.set(data.user);
      },
      error: () => {
        console.log('error');
      }
    })
  }

  onSubmit() {
    if (this.profileForm.valid) { 
      const userInfo = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        email: this.profileForm.value.email,
        position: this.profileForm.value.position,
        stack: this.profileForm.value.stack
      }
      console.log(userInfo);
      this.userService.sendUserInfo(userInfo).subscribe({
        next: () => console.log('success')
      })
      
    }
  }

  onCancel() {
    this.profileForm.reset();
  }

  openFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', this.userService.userId().toString());

      this.http.post('http://localhost:8000/User/upload_avatar.php', formData).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.userInfo.update(info => {
              if (info) {
                return { ...info, avatar: response.avatarPath };
              }
              return info;
            });
          }
        },
        error: (error) => {
          console.error('Error uploading avatar:', error);
        }
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}
