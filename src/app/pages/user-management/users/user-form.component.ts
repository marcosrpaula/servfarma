import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AccessLevel,
  ModuleDefinition,
  ModulePermissionState,
  RoleSummary,
  SavePermissionPayload,
  SaveUserPayload,
  UserSummary
} from '../../../core/models/user-management.models';
import { PermissionService } from '../../../core/services/permission.service';
import { UserManagementService } from '../../../core/services/user-management.service';

interface PermissionGroupValue {
  moduleKey: string;
  moduleName: string;
  hasAccess: boolean;
  accessLevel: AccessLevel;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false
})
export class UserFormComponent implements OnInit, OnDestroy {
  breadCrumbItems = [
    { label: 'Gestão' },
    { label: 'Usuários' },
    { label: 'Novo usuário', active: true }
  ];

  form: FormGroup;
  modules: ModuleDefinition[] = [];
  roles: RoleSummary[] = [];
  isEdit = false;
  loading = false;
  saving = false;
  feedback?: string;
  private userId?: string;
  private subscriptions: Subscription[] = [];

  readonly accessOptions: { label: string; value: AccessLevel; description: string }[] = [
    { label: 'Leitura', value: 'read', description: 'Pode visualizar informações.' },
    { label: 'Escrita', value: 'write', description: 'Pode criar e editar registros.' },
    { label: 'Admin', value: 'admin', description: 'Controle total do módulo.' }
  ];

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
      roleIds: [[] as string[]],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
        this.isEdit = !!this.userId && this.userId !== 'novo';
        this.initializeForm();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  get permissionsArray(): FormArray<FormGroup> {
    return this.form.get('permissions') as FormArray<FormGroup>;
  }

  get title(): string {
    return this.isEdit ? 'Editar usuário' : 'Novo usuário';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Atualizar usuário' : 'Cadastrar usuário';
  }

  get disabled(): boolean {
    return this.saving || this.loading;
  }

  private initializeForm(): void {
    this.loading = true;
    const roles$ = this.userManagementService.listRoles().pipe(catchError(() => of({ items: [] as RoleSummary[] })));
    const modules$ = this.userManagementService.getModules().pipe(catchError(() => of([] as ModuleDefinition[])));

    let user$ = of<UserSummary | null>(null);
    if (this.isEdit && this.userId) {
      user$ = this.userManagementService.getUser(this.userId).pipe(catchError(() => of(null)));
    }

    forkJoin({ roles: roles$, modules: modules$, user: user$ }).subscribe({
      next: ({ roles, modules, user }) => {
        this.roles = roles.items ?? roles ?? [];
        this.modules = this.mergeModuleDefinitions(modules ?? [], user?.permissions ?? []);
        this.buildPermissionControls(this.modules, user?.permissions ?? []);

        if (user) {
          this.patchForm(user);
          this.updateBreadcrumb(user);
        } else {
          this.updateBreadcrumb();
        }
        this.loading = false;
      },
      error: () => {
        this.feedback = 'Não foi possível carregar os dados. Atualize a página e tente novamente.';
        this.loading = false;
      }
    });
  }

  private mergeModuleDefinitions(modules: ModuleDefinition[], permissions: ModulePermissionState[]): ModuleDefinition[] {
    const map = new Map<string, ModuleDefinition>();
    modules?.forEach(module => {
      if (module?.key) {
        map.set(module.key.toLowerCase(), module);
      }
    });
    permissions?.forEach(permission => {
      const moduleKey = permission?.module?.key?.toLowerCase();
      if (moduleKey && !map.has(moduleKey)) {
        map.set(moduleKey, permission.module);
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const nameA = (a.name || a.key || '').toString().toLowerCase();
      const nameB = (b.name || b.key || '').toString().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  private buildPermissionControls(modules: ModuleDefinition[], permissions: ModulePermissionState[]): void {
    const controls = modules.map(module => {
      const existing = permissions.find(item => item.module?.key?.toLowerCase() === module.key?.toLowerCase());
      return this.fb.group({
        moduleKey: [module.key],
        moduleName: [module.name],
        hasAccess: [existing?.hasAccess ?? false],
        accessLevel: [existing?.hasAccess ? existing?.level ?? 'read' : 'none']
      });
    });
    this.form.setControl('permissions', this.fb.array(controls));
  }

  private patchForm(user: UserSummary): void {
    this.form.patchValue({
      name: user.name,
      email: user.email,
      active: user.active,
      roleIds: user.roles?.map(role => role.id) ?? []
    });
  }

  private updateBreadcrumb(user?: UserSummary): void {
    const current = this.isEdit ? 'Editar usuário' : 'Novo usuário';
    const suffix = user?.name ? `${current}: ${user.name}` : current;
    this.breadCrumbItems = [
      { label: 'Gestão' },
      { label: 'Usuários' },
      { label: suffix, active: true }
    ];
  }

  toggleAccess(index: number): void {
    const control = this.permissionsArray.at(index);
    if (!control) {
      return;
    }
    const hasAccess = control.get('hasAccess')?.value;
    if (hasAccess) {
      const accessLevelControl = control.get('accessLevel');
      if (!accessLevelControl?.value || accessLevelControl.value === 'none') {
        accessLevelControl?.setValue('read');
      }
    } else {
      control.get('accessLevel')?.setValue('none');
    }
  }

  setAccessLevel(index: number, level: AccessLevel): void {
    const control = this.permissionsArray.at(index);
    if (!control || !control.get('hasAccess')?.value) {
      return;
    }
    control.get('accessLevel')?.setValue(level);
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
      this.feedback = error?.error?.message ?? 'Não foi possível salvar as informações. Verifique os dados e tente novamente.';
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
    const value = this.form.value as { name: string; email: string; active: boolean; roleIds: string[]; permissions: PermissionGroupValue[]; };
    const permissions: SavePermissionPayload[] = (value.permissions ?? []).map(permission => ({
      moduleKey: permission.moduleKey,
      hasAccess: permission.hasAccess,
      accessLevel: permission.hasAccess ? permission.accessLevel ?? 'read' : 'none'
    }));

    return {
      id: this.userId,
      name: value.name,
      email: value.email,
      active: value.active,
      roleIds: value.roleIds ?? [],
      permissions
    };
  }
}
