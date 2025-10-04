import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss',
    standalone: false
})
export class ResetPasswordComponent {

  public routes = routes;
  constructor(
    private router: Router,
    private renderer:Renderer2
  ){}
  navigation(){
    this.router.navigate([routes.success])
  }

  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  ngOnInit():void{
    this.renderer.addClass(document.body,'bg-white');
  }
  ngOnDestroy():void{
    this.renderer.removeClass(document.body,'bg-white');
  }
  
}
