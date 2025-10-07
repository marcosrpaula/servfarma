import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NotificationService } from '../notifications/notification.service';
import { SKIP_ERROR_TOAST, SKIP_SUCCESS_TOAST, SUCCESS_MESSAGE } from './http-context.tokens';

@Injectable()
export class ApiFeedbackInterceptor implements HttpInterceptor {
  private readonly mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  constructor(private readonly notification: NotificationService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const method = req.method.toUpperCase();
    if (this.mutationMethods.has(method)) {
      this.notification.clearValidationErrors();
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && this.shouldNotifySuccess(method, req, event)) {
          const message = this.resolveSuccessMessage(method, req, event);
          this.notification.clearValidationErrors();
          this.notification.success(message);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (req.context.get(SKIP_ERROR_TOAST)) {
          return throwError(() => error);
        }
        const normalized = this.notification.handleHttpError(error);
        return throwError(() => normalized);
      }),
    );
  }

  private shouldNotifySuccess(
    method: string,
    req: HttpRequest<unknown>,
    res: HttpResponse<unknown>,
  ): boolean {
    if (!res.ok) {
      return false;
    }
    if (!this.mutationMethods.has(method)) {
      return false;
    }
    if (req.context.get(SKIP_SUCCESS_TOAST)) {
      return false;
    }
    return true;
  }

  private resolveSuccessMessage(
    method: string,
    req: HttpRequest<unknown>,
    res: HttpResponse<unknown>,
  ): string {
    const contextMessage = req.context.get(SUCCESS_MESSAGE);
    if (contextMessage && contextMessage.trim().length > 0) {
      return contextMessage;
    }

    const body = res.body as Record<string, unknown> | null;
    if (body && typeof body === 'object') {
      const candidate = this.pickString(body, ['message', 'title', 'detail']);
      if (candidate) {
        return candidate;
      }
    }

    switch (method) {
      case 'POST':
        return 'Registro criado com sucesso.';
      case 'PUT':
      case 'PATCH':
        return 'Registro atualizado com sucesso.';
      case 'DELETE':
        return 'Registro removido com sucesso.';
      default:
        return 'Operação realizada com sucesso.';
    }
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
}
