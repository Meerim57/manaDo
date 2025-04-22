import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class SignUpComponent {
  authService = inject(AuthService);

  signUpForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const { email, password } = this.signUpForm.value;

      this.authService.register(email, password).subscribe({
        next: (response) => {
          console.log('Регистрация успешна:', response);
        },
        error: err => {
          console.error('Ошибка регистрации:', err);
        }
      })
    }
  }
  
}
