import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-success-2',
    templateUrl: './success-2.component.html',
    styleUrl: './success-2.component.scss',
    standalone: false
})
export class Success2Component {
  public routes = routes;
  constructor(private router: Router,
    private renderer: Renderer2
  ){}
  navigation(){
    this.router.navigate([routes.login2])
  }
  ngOnInit():void{
    this.renderer.addClass(document.body,'bg-white');
  }
  ngOnDestroy():void{
    this.renderer.removeClass(document.body,'bg-white');
  }
}
