import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';

@Component({
    selector: 'app-otp',
    templateUrl: './otp.component.html',
    styleUrl: './otp.component.scss',
    standalone: false
})
export class OtpComponent {
  public oneTimePassword = {
    data1: "",
    data2: "",
    data3: "",
    data4: ""
  };
  public ValueChanged(data: string, box: string): void {
    if (box == 'digit-1' && data.length > 0) {
      document.getElementById('digit-2')?.focus();
    } else if (box == 'digit-2' && data.length > 0) {
      document.getElementById('digit-3')?.focus();
    } else if (box == 'digit-3' && data.length > 0) {
      document.getElementById('digit-4')?.focus();
    } else {
      return
    }
  }
  public tiggerBackspace(data: string, box: string) {
    let StringyfyData;
    if (data) {
      StringyfyData = data.toString();
    } else {
      StringyfyData = null;
    }
    if (box == 'digit-4' && StringyfyData == null) {
      document.getElementById('digit-3')?.focus();
    } else if (box == 'digit-3' && StringyfyData == null) {
      document.getElementById('digit-2')?.focus();
    } else if (box == 'digit-2' && StringyfyData == null) {
      document.getElementById('digit-1')?.focus();
    }
  }

  public routes = routes;
  constructor(private router: Router){}
  navigation(){
    this.router.navigate([routes.resetPassword])
  }
}
