import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-two-step-verification-3',
    templateUrl: './two-step-verification-3.component.html',
    styleUrl: './two-step-verification-3.component.scss',
    standalone: false
})
export class TwoStepVerification3Component {
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
