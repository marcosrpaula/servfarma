import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';

@Component({
    selector: 'app-success',
    templateUrl: './success.component.html',
    styleUrl: './success.component.scss',
    standalone: false
})
export class SuccessComponent {
  public routes = routes;
  constructor(private router: Router,
    private renderer: Renderer2
  ){}
  navigation(){
    this.router.navigate([routes.loginpro])
  }
  ngOnInit():void{
    this.renderer.addClass(document.body,'bg-white');
  }
  ngOnDestroy():void{
    this.renderer.removeClass(document.body,'bg-white');
  }
}
