import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { UserManagementService } from 'src/app/core/services/user-management.service';
import * as UsersActions from './users.actions';
import { selectUsersState } from './users.selectors';
import { RootReducerState } from '../../index';

@Injectable()
export class UsersEffects {
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.initUsersPage),
      map(() => UsersActions.loadUsers())
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.loadUsers,
        UsersActions.setFilters,
        UsersActions.setPagination,
        UsersActions.setSort
      ),
      withLatestFrom(this.store.select(selectUsersState)),
      switchMap(([action, state]) =>
        this.userService
          .listUsers({
            page: state.pagination.page,
            pageSize: state.pagination.pageSize,
            filters: state.filters,
            sort: state.sort,
          })
          .pipe(
            map((response) => UsersActions.loadUsersSuccess({ users: response.data, pagination: response.meta })),
            catchError((error) =>
              of(
                UsersActions.loadUsersFailure({
                  error: error?.message ?? 'Não foi possível carregar a lista de usuários.',
                })
              )
            )
          )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      switchMap(({ payload }) =>
        this.userService.createUser(payload).pipe(
          map((user) => UsersActions.createUserSuccess({ user })),
          catchError((error) =>
            of(
              UsersActions.createUserFailure({
                error: error?.message ?? 'Não foi possível criar o usuário.',
              })
            )
          )
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ payload }) =>
        this.userService.updateUser(payload).pipe(
          map((user) => UsersActions.updateUserSuccess({ user })),
          catchError((error) =>
            of(
              UsersActions.updateUserFailure({
                error: error?.message ?? 'Não foi possível atualizar o usuário.',
              })
            )
          )
        )
      )
    )
  );

  updateUserStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUserStatus),
      switchMap(({ payload }) =>
        this.userService.updateUserStatus(payload).pipe(
          map((user) => UsersActions.updateUserStatusSuccess({ user })),
          catchError((error) =>
            of(
              UsersActions.updateUserStatusFailure({
                error: error?.message ?? 'Não foi possível atualizar o status do usuário.',
              })
            )
          )
        )
      )
    )
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.createUserSuccess,
        UsersActions.updateUserSuccess,
        UsersActions.updateUserStatusSuccess
      ),
      map(() => UsersActions.loadUsers())
    )
  );

  constructor(private actions$: Actions, private store: Store<RootReducerState>, private userService: UserManagementService) {}
}
