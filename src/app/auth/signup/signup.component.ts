import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  standalone: false,
})
export class SignupComponent {
  public routes = routes;
  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
}
