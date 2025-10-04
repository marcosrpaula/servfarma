import { Component } from '@angular/core';
import { DataService } from '../../../shared/data/data.service';

@Component({
    selector: 'app-collapse-header',
    templateUrl: './collapse-header.component.html',
    styleUrl: './collapse-header.component.scss',
    standalone: false
})
export class CollapseHeaderComponent {
  public isCollapsed = false;

  toggleCollapse() {
    this.data.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  constructor(private data: DataService) {}
}
