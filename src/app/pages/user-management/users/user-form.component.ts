import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  RoleSummary,
  SaveUserPayload,
  UserSummary
} from '../../../core/models/user-management.models';
import { PermissionService } from '../../../core/services/permission.service';
import { UserManagementService } from '../../../core/services/user-management.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false
})
export class UserFormComponent implements OnInit, OnDestroy {
  breadCrumbItems = [
    { label: 'Gestao' },
    { label: 'Usuarios' },
    { label: 'Novo usuario', active: true }
  ];

  form: FormGroup;
  roles: RoleSummary[] = [];
  isEdit = false;
  loading = false;
  saving = false;
  feedback?: string;
  private userId?: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userManagementService: UserManagementService,
    private readonly permissionService: PermissionService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      active: [true],
      permissionIds: [[] as string[]]
    });
  }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
        this.isEdit = !!this.userId && this.userId !== 'novo';
        if (this.isEdit) {
          this.form.get('email')?.disable();
        } else {
          this.form.get('email')?.enable();
        }
        this.initializeForm();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  get title(): string {
    return this.isEdit ? 'Editar usuario' : 'Novo usuario';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Atualizar usuario' : 'Cadastrar usuario';
  }

  get disabled(): boolean {
    return this.saving || this.loading;
  }

  private initializeForm(): void {
    this.loading = true;
    const roles$ = this.userManagementService.listRoles().pipe(catchError(() => of({ items: [] as RoleSummary[] })));

    let user$ = of<UserSummary | null>(null);
    if (this.isEdit && this.userId) {
      user$ = this.userManagementService.getUser(this.userId).pipe(catchError(() => of(null)));
    }

    forkJoin({ roles: roles$, user: user$ }).subscribe({
      next: ({ roles, user }) => {
        this.roles = roles.items ?? [];
        if (user) {
          this.patchForm(user);
          this.updateBreadcrumb(user);
        } else {
          this.updateBreadcrumb();
        }
        this.loading = false;
      },
      error: () => {
        this.feedback = 'Nao foi possivel carregar os dados. Atualize a pagina e tente novamente.';
        this.loading = false;
      }
    });
  }

  private patchForm(user: UserSummary): void {
    const permissionIds = (user.permissions ?? []).map(role => role.id).filter(id => !!id);
    this.form.patchValue({
      name: user.name,
      email: user.email,
      active: user.active,
      permissionIds
    });
  }

  private updateBreadcrumb(user?: UserSummary): void {
    const current = this.isEdit ? 'Editar usuario' : 'Novo usuario';
    const suffix = user?.name ? `${current}: ${user.name}` : current;
    this.breadCrumbItems = [
      { label: 'Gestao' },
      { label: 'Usuarios' },
      { label: suffix, active: true }
    ];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.feedback = undefined;

    const payload = this.buildPayload();
    const request$ = this.isEdit && this.userId
      ? this.userManagementService.updateUser(this.userId, payload)
      : this.userManagementService.createUser(payload);

    request$.pipe(catchError(error => {
      this.feedback = error?.error?.message ?? 'Nao foi possivel salvar as informacoes. Verifique os dados e tente novamente.';
      this.saving = false;
      return of(null);
    })).subscribe(result => {
      if (!result) {
        return;
      }
      this.saving = false;
      this.permissionService.refresh();
      this.router.navigate(['gestao', 'usuarios']);
    });
  }

  cancel(): void {
    this.router.navigate(['gestao', 'usuarios']);
  }

  private buildPayload(): SaveUserPayload {
    const value = this.form.getRawValue() as { name: string; email: string; active: boolean; permissionIds: string[]; };
    return {
      id: this.userId,
      name: value.name,
      email: value.email,
      active: value.active,
      permissionIds: value.permissionIds ?? []
    };
  }
}
