import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';

import { AuthenticationService } from '../services/auth.service';
import { AuthfakeauthenticationService } from '../services/authfake.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private authfackservice: AuthfakeauthenticationService,
        private keycloakService: KeycloakService,
        public router:Router
    ) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (environment.defaultauth === 'keycloak') {
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
        if (environment.defaultauth === 'firebase') {
            // add authorization header with jwt token if available
            let currentUser = this.authenticationService.currentUser();
            if (currentUser && currentUser.token) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
            }
        } else {
            // add authorization header with jwt token if available
            const currentUser = this.authfackservice.currentUserValue;
            if (currentUser && currentUser.token) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                });
            }
        }
        return next.handle(request).pipe(
            catchError((error) => {
              if (error.status === 401) {
                this.router.navigate(['/auth/login']);
              }
              return throwError(error);
            })
          );;
    }
}
