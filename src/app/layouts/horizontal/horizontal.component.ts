import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-horizontal',
    templateUrl: './horizontal.component.html',
    styleUrls: ['./horizontal.component.scss'],
    standalone: false
})

/**
 * Horizontal Component
 */
export class HorizontalComponent implements OnInit {

  constructor() { }

  isCondensed = false;

  ngOnInit(): void {
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    if (document.documentElement.clientWidth <= 1024) {
      document.body.classList.toggle('menu');
    }
  }
}
