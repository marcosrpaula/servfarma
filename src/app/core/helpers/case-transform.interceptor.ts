import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { keysToCamelCase, keysToSnakeCase, normalizeHttpParams } from '../utils/case-converter';

function shouldTransformRequestBody(body: unknown): boolean {
  if (body === null || body === undefined) {
    return false;
  }

  if (typeof body !== 'object') {
    return false;
  }

  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
    return false;
  }

  return true;
}

function transformParams(params: HttpParams): HttpParams {
  if (!params || params.keys().length === 0) {
    return params;
  }

  const paramsAsObject: Record<string, unknown> = {};
  params.keys().forEach((key) => {
    const values = params.getAll(key) ?? [];
    if (values.length === 0) {
      return;
    }
    paramsAsObject[key] = values.length === 1 ? values[0] : values;
  });

  const normalized = normalizeHttpParams(paramsAsObject);
  let updatedParams = new HttpParams();

  Object.entries(normalized).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value
        .filter((item) => item !== undefined && item !== null)
        .forEach((item) => {
          updatedParams = updatedParams.append(key, String(item));
        });
      return;
    }

    if (value !== undefined && value !== null) {
      updatedParams = updatedParams.append(key, String(value));
    }
  });

  return updatedParams;
}

function isJsonContent(headers: HttpRequest<unknown>['headers'] | HttpResponse<unknown>['headers']): boolean {
  const contentType = headers.get('Content-Type');
  return !contentType || contentType.toLowerCase().includes('application/json');
}

@Injectable()
export class CaseTransformInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let updatedRequest = req;

    if (shouldTransformRequestBody(req.body) && isJsonContent(req.headers)) {
      updatedRequest = updatedRequest.clone({ body: keysToSnakeCase(req.body as any) });
    }

    if (req.params && req.params.keys().length > 0) {
      updatedRequest = updatedRequest.clone({ params: transformParams(req.params) });
    }

    return next.handle(updatedRequest).pipe(
      map((event) => {
        if (event instanceof HttpResponse && isJsonContent(event.headers)) {
          return event.clone({ body: keysToCamelCase(event.body as any) });
        }
        return event;
      })
    );
  }
}
