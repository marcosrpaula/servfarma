import { Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

export interface ValidationErrorEntry {
  field: string;
  messages: string[];
}

export interface NormalizedErrorPayload {
  status: number;
  title: string;
  message?: string;
  traceId?: string;
  validationErrors: ValidationErrorEntry[];
  raw: unknown;
}

export type NormalizedHttpError = HttpErrorResponse & { normalizedError: NormalizedErrorPayload };

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly messageService: MessageService, private readonly zone: NgZone) {}

  success(detail: string, summary = 'Operação concluída'): void {
    this.zone.run(() => {
      this.messageService.add({ severity: 'success', summary, detail, life: 3500 });
    });
  }

  info(detail: string, summary = 'Informação'): void {
    this.zone.run(() => {
      this.messageService.add({ severity: 'info', summary, detail, life: 3500 });
    });
  }

  error(detail: string, summary = 'Erro'): void {
    this.zone.run(() => {
      this.messageService.add({ severity: 'error', summary, detail, life: 6000 });
    });
  }

  clearValidationErrors(): void {
    this.zone.run(() => {
      this.messageService.clear('validation');
    });
  }

  handleHttpError(error: HttpErrorResponse): NormalizedHttpError {
    const normalized = this.normalizeError(error);
    const enriched = error as NormalizedHttpError;
    enriched.normalizedError = normalized;

    this.zone.run(() => {
      if (normalized.validationErrors.length > 0) {
        const detail = this.composeValidationDetail(
          normalized.message,
          normalized.validationErrors
        );
        this.messageService.clear('validation');
        this.messageService.add({
          severity: 'error',
          summary: normalized.title,
          detail,
          life: 7000,
          key: 'validation',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: normalized.title,
          detail: normalized.message ?? 'Ocorreu um erro inesperado.',
          life: 7000,
        });
      }
    });

    console.warn('HTTP error interceptado', {
      status: error.status,
      message: normalized.message,
      traceId: normalized.traceId,
      validationErrors: normalized.validationErrors,
      raw: normalized.raw,
    });

    return enriched;
  }

  private normalizeError(error: HttpErrorResponse): NormalizedErrorPayload {
    const fallbackTitle = this.resolveTitle(error.status, error.statusText);
    const rawBody = error.error;
    let title = fallbackTitle;
    let message: string | undefined;
    let traceId: string | undefined;
    const validationErrors: ValidationErrorEntry[] = [];

    if (rawBody && typeof rawBody === 'object') {
      const maybeTitle = this.pickString(rawBody, ['title', 'error', 'message']);
      title = maybeTitle ?? fallbackTitle;
      message = this.pickString(rawBody, ['message', 'detail', 'errorDescription']);
      traceId = this.pickString(rawBody, ['traceId', 'trace_id']);

      const rawErrors = (rawBody as any).errors ?? (rawBody as any).validationErrors ?? null;
      if (rawErrors && typeof rawErrors === 'object') {
        Object.entries(rawErrors).forEach(([field, fieldErrors]) => {
          const messages = Array.isArray(fieldErrors)
            ? fieldErrors.map(item => String(item))
            : [String(fieldErrors)];
          validationErrors.push({ field, messages });
        });
      }
    } else if (typeof rawBody === 'string' && rawBody.trim().length) {
      message = rawBody;
      title = fallbackTitle;
    } else if (error.message) {
      message = error.message;
    }

    if (validationErrors.length > 0) {
      title = 'Erro de validação';
      if (!message || message.trim().length === 0 || message === fallbackTitle) {
        message = 'Existem campos que precisam ser corrigidos.';
      }
    }

    if (!message || message.trim().length === 0) {
      message = fallbackTitle;
    }

    return {
      status: error.status,
      title,
      message,
      traceId,
      validationErrors,
      raw: rawBody,
    };
  }

  private pickString(payload: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = payload[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }
    return undefined;
  }

  private resolveTitle(status: number, statusText: string | null): string {
    if (status === 0) {
      return 'Falha de conexão';
    }
    if (statusText && statusText.trim().length > 0) {
      return statusText;
    }
    switch (status) {
      case 400:
        return 'Requisição inválida';
      case 401:
        return 'Não autorizado';
      case 403:
        return 'Acesso negado';
      case 404:
        return 'Recurso não encontrado';
      case 409:
        return 'Conflito';
      case 422:
        return 'Erro de validação';
      case 500:
        return 'Erro interno do servidor';
      case 503:
        return 'Serviço indisponível';
      default:
        return 'Erro';
    }
  }

  private composeValidationDetail(
    message: string | undefined,
    entries: ValidationErrorEntry[]
  ): string {
    const normalizedMessage =
      message && message.trim().length > 0
        ? message.trim()
        : 'Existem campos que precisam ser corrigidos.';
    const items = this.normalizeEntries(entries);
    if (items.length === 0) {
      return normalizedMessage;
    }
    const bulletList = items.map(item => `• ${item}`).join('\n');
    return `${normalizedMessage}\n${bulletList}`;
  }

  private normalizeEntries(entries: ValidationErrorEntry[]): string[] {
    return entries
      .map(entry => {
        const label = entry.field ? this.formatField(entry.field) : '';
        const messages = this.normalizeMessages(entry);
        const text = messages.join(' ');
        if (!text.trim()) {
          return '';
        }
        return label ? `${label}: ${text}` : text;
      })
      .filter(item => item.trim().length > 0);
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
