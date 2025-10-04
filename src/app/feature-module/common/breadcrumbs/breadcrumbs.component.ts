import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  standalone: false,
})
export class BreadcrumbsComponent {
  @Input() title = '';
  @Input() breadcrumbItems: Array<{ label: string; active?: boolean; link?: string }> = [];
}
