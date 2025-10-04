import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrl: './signin.component.scss',
    standalone: false
})
export class SigninComponent {
  public routes = routes
  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(private router: Router){}
  navigation(){
    this.router.navigate([routes.index])
  }
}
