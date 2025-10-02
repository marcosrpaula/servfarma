import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  standalone: false
})
export class RoleFormComponent {
  breadCrumbItems = [
    { label: 'Gestao' },
    { label: 'Perfis' },
    { label: 'Indisponivel', active: true }
  ];

  constructor(private readonly router: Router) { }

  back(): void {
    this.router.navigate(['gestao', 'roles']);
  }
}
