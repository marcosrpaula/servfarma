import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-reset-password-2',
    templateUrl: './reset-password-2.component.html',
    styleUrl: './reset-password-2.component.scss',
    standalone: false
})
export class ResetPassword2Component {
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
  passwordValue: string = '';
  strengthLevel: string = '';
  passwordInfoMessage: string | null = null;
  passwordInfoColor: string = '';

  private poorRegExp = /[a-z]/;
  private weakRegExp = /(?=.*?[0-9])/;
  private strongRegExp = /(?=.*?[#?!@$%^&*-])/;
  private whitespaceRegExp = /^$|\s+/;

  checkPasswordStrength(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const password = inputElement.value;
    this.passwordValue = password;
  
    const passwordLength = password.length;
    const hasPoor = this.poorRegExp.test(password);
    const hasWeak = this.weakRegExp.test(password);
    const hasStrong = this.strongRegExp.test(password);
    const hasWhitespace = this.whitespaceRegExp.test(password);
  
    if (password === '') {
      this.resetStrength();
      return;
    }
  
    if (hasWhitespace) {
      this.passwordInfoMessage = 'Whitespaces are not allowed';
      this.passwordInfoColor = 'red';
      this.strengthLevel = '';
      return;
    }
  
    if (passwordLength < 8) {
      this.strengthLevel = 'poor';
      this.passwordInfoMessage = 'Weak. Must contain at least 8 characters.';
      this.passwordInfoColor = 'red';
    } else if (hasPoor || hasWeak || hasStrong) {
      this.strengthLevel = 'weak';
      this.passwordInfoMessage = 'Average. Must contain at least 1 letter or number.';
      this.passwordInfoColor = '#FFB54A';
    }
  
    if (passwordLength >= 8 && hasPoor && (hasWeak || hasStrong)) {
      this.strengthLevel = 'strong';
      this.passwordInfoMessage = 'Almost strong. Must contain a special symbol.';
      this.passwordInfoColor = '#1D9CFD';
    }
  
    if (passwordLength >= 8 && hasPoor && hasWeak && hasStrong) {
      this.strengthLevel = 'heavy';
      this.passwordInfoMessage = 'Awesome! You have a secure password.';
      this.passwordInfoColor = '#159F46';
    }
  }
  

  private resetStrength(): void {
    this.strengthLevel = '';
    this.passwordInfoMessage = null;
  }
}
