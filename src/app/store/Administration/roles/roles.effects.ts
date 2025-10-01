import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { UserManagementService } from 'src/app/core/services/user-management.service';
import * as RolesActions from './roles.actions';

@Injectable()
export class RolesEffects {
  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRoles),
      switchMap(() =>
        this.userService.getRoles().pipe(
          map((roles) => RolesActions.loadRolesSuccess({ roles })),
          catchError((error) =>
            of(
              RolesActions.loadRolesFailure({
                error: error?.message ?? 'Não foi possível carregar as permissões.',
              })
            )
          )
        )
      )
    )
  );

  constructor(private actions$: Actions, private userService: UserManagementService) {}
}
