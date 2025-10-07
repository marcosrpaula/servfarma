import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: false,
})
export class FooterComponent implements OnInit {
  currentYear!: number;

  constructor(private cdRef: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.cdRef.detectChanges();
  }
}
