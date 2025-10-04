import { Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
  private readonly validationErrorsSubject = new BehaviorSubject<ValidationErrorEntry[]>([]);

  readonly validationErrors$: Observable<ValidationErrorEntry[]> = this.validationErrorsSubject.asObservable();

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
    this.validationErrorsSubject.next([]);
  }

  publishValidationErrors(entries: ValidationErrorEntry[]): void {
    this.validationErrorsSubject.next(entries);
  }

  handleHttpError(error: HttpErrorResponse): NormalizedHttpError {
    const normalized = this.normalizeError(error);
    const enriched = error as NormalizedHttpError;
    enriched.normalizedError = normalized;

    this.zone.run(() => {
      if (normalized.validationErrors.length > 0) {
        this.messageService.add({
          severity: 'error',
          summary: normalized.title,
          life: 7000,
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
}
