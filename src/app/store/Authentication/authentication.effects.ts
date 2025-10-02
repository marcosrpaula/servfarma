import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { EMPTY, from, of } from 'rxjs';
import { login, loginFailure, logout, logoutSuccess, Register, RegisterFailure } from './authentication.actions';
import { KeycloakService } from '../../core/services/keycloak.service';

@Injectable()
export class AuthenticationEffects {

  Register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Register),
      map(() => RegisterFailure({ error: 'Use Keycloak para criar novos usuarios.' }))
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(() =>
        from(this.keycloakService.login({ redirectUri: window.location.origin + '/' })).pipe(
          switchMap(() => EMPTY),
          catchError((error) => of(loginFailure({ error: error?.message ?? 'Falha ao redirecionar para o Keycloak.' })))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      map(() => logoutSuccess())
    )
  );

  constructor(
    private actions$: Actions,
    private keycloakService: KeycloakService
  ) { }
}
