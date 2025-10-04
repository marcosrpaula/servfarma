import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';

@Component({
    selector: 'app-register-2',
    templateUrl: './register-2.component.html',
    styleUrl: './register-2.component.scss',
    standalone: false
})
export class Register2Component {
  public routes = routes
  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  constructor(
    private router: Router,
    private renderer:Renderer2
  ){}
  navigation(){
    this.router.navigate([routes.index])
  }
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-white');
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-white');
  }
}
