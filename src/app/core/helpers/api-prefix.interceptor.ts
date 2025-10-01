import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

function joinUrl(...segments: (string | undefined)[]): string {
  const sanitized = segments
    .filter((segment) => !!segment && segment.trim() !== '')
    .map((segment, index) => {
      if (!segment) {
        return '';
      }
      const trimmed = segment.trim();
      if (index === 0) {
        return trimmed.replace(/\/+$/g, '');
      }
      return trimmed.replace(/^\/+|\/+$/g, '');
    })
    .filter((segment) => segment.length > 0);

  return sanitized.join('/');
}

@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (/^https?:\/\//i.test(req.url) || req.url.startsWith('assets/')) {
      return next.handle(req);
    }

    const { baseUrl, version } = environment.api ?? {};
    if (!baseUrl) {
      return next.handle(req);
    }

    const fullUrl = joinUrl(baseUrl, version, req.url);
    return next.handle(req.clone({ url: fullUrl }));
  }
}
