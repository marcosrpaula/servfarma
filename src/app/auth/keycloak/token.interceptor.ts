import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../config/environment';
import { KeycloakAuthService } from './keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: KeycloakAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only attach tokens to our API
    if (!req.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(req);
    }
    return from(this.auth.getToken()).pipe(
      switchMap(token => {
        if (token) {
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }
}
