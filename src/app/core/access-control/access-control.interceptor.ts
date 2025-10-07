import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AccessControlService } from './access-control.service';

@Injectable()
export class AccessControlInterceptor implements HttpInterceptor {
  constructor(private readonly access: AccessControlService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requirement = this.access.resolveHttpRequirement(req.method, req.url);

    if (!requirement || !this.access.isReady()) {
      return next.handle(req);
    }

    if (this.access.can(requirement.module, requirement.level)) {
      return next.handle(req);
    }

    console.warn('Client blocked forbidden request', {
      method: req.method,
      url: req.url,
      requirement,
    });

    const errorResponse = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
      url: req.url,
      error: {
        message: 'Acesso negado: o seu perfil e somente leitura para este modulo.',
        module: requirement.module,
        requiredLevel: requirement.level,
      },
    });

    return throwError(() => errorResponse);
  }
}
