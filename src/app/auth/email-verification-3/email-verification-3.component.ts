import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-email-verification-3',
    templateUrl: './email-verification-3.component.html',
    styleUrl: './email-verification-3.component.scss',
    standalone: false
})
export class EmailVerification3Component {
  public routes = routes;

  constructor(
    private router: Router,
    private renderer:Renderer2
  ){}
  navigation(){
    this.router.navigate([routes.index])
  }
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-linear-gradiant');
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-linear-gradiant');
  }
}
