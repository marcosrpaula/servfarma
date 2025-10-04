import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ValidationErrorEntry } from './notification.service';

type DisplayError = {
  label: string;
  text: string;
};

@Component({
  selector: 'app-validation-errors-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="displayErrors.length > 0">
      <div class="alert custom-alert-icon alert-danger d-flex align-items-start gap-3 shadow-sm mb-3" role="alert">
        <i class="ti ti-alert-triangle fs-20 flex-shrink-0 mt-1"></i>
        <div class="flex-grow-1">
          <h6 class="mb-1 text-danger fw-semibold">Não foi possível concluir a operação.</h6>
          <p class="mb-2 text-muted">Corrija os itens abaixo e tente novamente:</p>
          <ul class="mb-0 ps-3 text-body list-unstyled">
            <li *ngFor="let item of displayErrors; trackBy: trackDisplayError" class="mb-1">
              <ng-container *ngIf="item.label">
                <strong>{{ item.label }}:</strong>
              </ng-container>
              {{ item.text }}
            </li>
          </ul>
        </div>
        <button type="button" data-bs-dismiss="alert" aria-label="Close" class="btn-close"><i class="fas fa-xmark"></i></button>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationErrorsBannerComponent {
  @Input({ required: true }) set errors(value: ValidationErrorEntry[] | null | undefined) {
    this.displayErrors = this.normalizeEntries(value ?? []);
  }

  displayErrors: DisplayError[] = [];

  trackDisplayError = (_: number, item: DisplayError): string => `${item.label}|${item.text}`;

  private normalizeEntries(entries: ValidationErrorEntry[]): DisplayError[] {
    return entries
      .map(entry => {
        const label = entry.field ? this.formatField(entry.field) : '';
        const messages = this.normalizeMessages(entry);
        const text = messages.join(' ');
        return { label, text };
      })
      .filter(item => item.text.trim().length > 0);
  }

  private formatField(field: string): string {
    return field
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .map(chunk => (chunk ? chunk[0].toUpperCase() + chunk.slice(1).toLowerCase() : chunk))
      .join(' ')
      .trim();
  }

  private normalizeMessages(error: ValidationErrorEntry): string[] {
    if (!error.messages || error.messages.length === 0) {
      return ['Revise os dados informados.'];
    }

    return error.messages
      .map(message => this.normalizeMessage(message))
      .filter(text => text.trim().length > 0);
  }

  private normalizeMessage(message: string | undefined): string {
    if (!message) {
      return '';
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return '';
    }

    let cleaned = trimmed.replace(/^The\s+[\w\s]+\sfield\s+/i, '').trim();
    cleaned = cleaned.replace(/^This\s+field\s+/i, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ');

    if (/^is required\.?$/i.test(cleaned)) {
      return 'Este campo é obrigatório.';
    }

    const minMatch = cleaned.match(/^must be at least\s+(\d+)\s+characters?\.?$/i);
    if (minMatch) {
      return `Informe pelo menos ${minMatch[1]} caracteres.`;
    }

    const maxMatch = cleaned.match(/^must be at most\s+(\d+)\s+characters?\.?$/i);
    if (maxMatch) {
      return `Use no máximo ${maxMatch[1]} caracteres.`;
    }

    if (!cleaned.endsWith('.')) {
      cleaned = `${cleaned}.`;
    }

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}
