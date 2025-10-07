import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { keysToCamelCase, keysToSnakeCase, toSnakeCase } from './case-convert.utils';

/**
 * Transforma:
 *  - Requisições: body + query params -> snake_case
 *  - Respostas: body -> camelCase
 * Para pular transformação, envie o header 'X-Case-Transform: skip'
 */
@Injectable()
export class SnakeCaseInterceptor implements HttpInterceptor {
  private readonly snakeCaseQueryValueKeys = new Set([
    'orderBy',
    'order_by',
    'sortBy',
    'sort_by',
    'orderField',
    'order_field',
  ]);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get('X-Case-Transform') === 'skip') {
      return next.handle(req);
    }

    // Outgoing: body -> snake_case
    let newReq = req;
    if (req.body && typeof req.body === 'object') {
      newReq = newReq.clone({ body: keysToSnakeCase(req.body) });
    }

    // Outgoing: query params -> snake_case keys
    if (req.params && (req.params as any).keys) {
      const keys = (req.params as any).keys();
      if (keys && keys.length) {
        let params = new HttpParams();
        for (const k of keys) {
          const values = req.params.getAll(k) || [];
          const snakeKey = toSnakeCase(k);
          const shouldSnakeCaseValue =
            this.snakeCaseQueryValueKeys.has(k) || this.snakeCaseQueryValueKeys.has(snakeKey);

          for (const v of values) {
            const normalizedValue =
              shouldSnakeCaseValue && typeof v === 'string' ? toSnakeCase(v) : v;
            params = params.append(snakeKey, String(normalizedValue));
          }
        }
        newReq = newReq.clone({ params });
      }
    }

    // Incoming: body -> camelCase
    return next.handle(newReq).pipe(
      map((event) => {
        if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
          const camel = keysToCamelCase(event.body);
          return event.clone({ body: camel });
        }
        return event;
      }),
    );
  }
}
