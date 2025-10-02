import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private keycloakService: KeycloakService,
        public router:Router
    ) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return from(this.keycloakService.getToken()).pipe(
            switchMap(token => {
                if (token) {
                    request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }
                return next.handle(request);
            }),
            catchError((error) => {
                if (error.status === 401) {
                    this.router.navigate(['/auth/login']);
                }
                return throwError(error);
            })
        );
    }
}
