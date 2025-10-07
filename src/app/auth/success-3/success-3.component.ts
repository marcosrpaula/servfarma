import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';

@Component({
  selector: 'app-success-3',
  templateUrl: './success-3.component.html',
  styleUrl: './success-3.component.scss',
  standalone: false,
})
export class Success3Component {
  public routes = routes;
  constructor(
    private router: Router,
    private renderer: Renderer2,
  ) {}
  navigation() {
    this.router.navigate([routes.login3]);
  }
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-linear-gradiant');
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-llinear-gradiant');
  }
}
