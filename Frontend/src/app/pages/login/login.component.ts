import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  loginForm!: FormGroup;

  loginObj: any = {
    userId: 0,
    emailId: "",
    fullName: "",
    password: ""
  }

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    this.authService.login().subscribe({
      next: (user) => {
        if (user.email === this.loginForm.value.email && user.password === this.loginForm.value.password) {
          this.router.navigate(['/board']);
        }
      },
      error: err => {
        console.error('Ошибка входа:', err);
      }
    })
    
  }
}
