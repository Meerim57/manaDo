import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ]
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  loginForm!: FormGroup;
  loginError = signal(false);

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
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: (data) => {
        if (data.status === 'success') {
          this.router.navigate(['/board']);
        }
      },
      error: () => {
        this.loginError.set(true);
      }
    })
  }
}
