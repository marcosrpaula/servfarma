import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-error-500',
    templateUrl: './error-500.component.html',
    styleUrl: './error-500.component.scss',
    standalone: false
})
export class Error500Component {
  public routes=routes;
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
