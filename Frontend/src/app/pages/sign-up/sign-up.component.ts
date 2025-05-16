import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule
  ]
})
export class SignUpComponent {
  authService = inject(AuthService);

  signUpForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router,) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    console.log('in submit');
    if (this.signUpForm.valid) {
      const { email, password } = this.signUpForm.value;
      console.log('in submit');
      this.authService.register(email, password).subscribe({
        next: (response) => {
          console.log('Регистрация успешна:', response);
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error('Ошибка регистрации:', err);
        }
      })
    }
  }
  
}
