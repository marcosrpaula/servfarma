import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';

@Component({
  selector: 'app-forgot-password-2',
  templateUrl: './forgot-password-2.component.html',
  styleUrl: './forgot-password-2.component.scss',
  standalone: false,
})
export class ForgotPassword2Component {
  public routes = routes;

  constructor(
    private router: Router,
    private renderer: Renderer2,
  ) {}
  navigation() {
    this.router.navigate([routes.index]);
  }
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-white');
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-white');
  }
}
