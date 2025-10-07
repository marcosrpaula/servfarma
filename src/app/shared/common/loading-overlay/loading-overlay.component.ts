import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'loading-overlay',
    '[class.loading-overlay--active]': 'show',
    '[attr.aria-hidden]': '!show',
  },
})
export class LoadingOverlayComponent {
  @Input({ required: true }) show = false;
  @Input() message: string | null = 'Processando...';
  @Input() ariaLive: 'off' | 'polite' | 'assertive' = 'polite';
}
