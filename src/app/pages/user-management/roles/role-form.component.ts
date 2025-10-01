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
  SaveRolePayload
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
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  standalone: false
})
export class RoleFormComponent implements OnInit, OnDestroy {
  breadCrumbItems = [
    { label: 'Gestão' },
    { label: 'Perfis' },
    { label: 'Novo perfil', active: true }
  ];

  form: FormGroup;
  modules: ModuleDefinition[] = [];
  isEdit = false;
  loading = false;
  saving = false;
  feedback?: string;
  private roleId?: string;
  private subscriptions: Subscription[] = [];

  readonly accessOptions: { label: string; value: AccessLevel; description: string }[] = [
    { label: 'Leitura', value: 'read', description: 'Permite visualizar informações.' },
    { label: 'Escrita', value: 'write', description: 'Permite criar e editar dados.' },
    { label: 'Admin', value: 'admin', description: 'Concede todos os privilégios do módulo.' }
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
      description: ['', [Validators.maxLength(255)]],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.permissionService.ensurePermissionsLoaded();
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        this.roleId = params.get('id') ?? undefined;
        this.isEdit = !!this.roleId && this.roleId !== 'novo';
        this.loadData();
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
    return this.isEdit ? 'Editar perfil' : 'Novo perfil';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Atualizar perfil' : 'Criar perfil';
  }

  get disabled(): boolean {
    return this.loading || this.saving;
  }

  private loadData(): void {
    this.loading = true;
    const modules$ = this.userManagementService.getModules().pipe(catchError(() => of([] as ModuleDefinition[])));
    let role$ = of<RoleSummary | null>(null);
    if (this.isEdit && this.roleId) {
      role$ = this.userManagementService.getRole(this.roleId).pipe(catchError(() => of(null)));
    }

    forkJoin({ modules: modules$, role: role$ }).subscribe({
      next: ({ modules, role }) => {
        this.modules = this.mergeModuleDefinitions(modules ?? [], role?.permissions ?? []);
        this.buildPermissionControls(this.modules, role?.permissions ?? []);
        if (role) {
          this.patchForm(role);
          this.updateBreadcrumb(role);
        } else {
          this.updateBreadcrumb();
        }
        this.loading = false;
      },
      error: () => {
        this.feedback = 'Não foi possível carregar os dados do perfil. Tente novamente mais tarde.';
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
      const key = permission?.module?.key?.toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, permission.module);
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
      const existing = permissions.find(permission => permission.module?.key?.toLowerCase() === module.key?.toLowerCase());
      return this.fb.group({
        moduleKey: [module.key],
        moduleName: [module.name],
        hasAccess: [existing?.hasAccess ?? false],
        accessLevel: [existing?.hasAccess ? existing?.level ?? 'read' : 'none']
      });
    });
    this.form.setControl('permissions', this.fb.array(controls));
  }

  private patchForm(role: RoleSummary): void {
    this.form.patchValue({
      name: role.name,
      description: role.description
    });
  }

  private updateBreadcrumb(role?: RoleSummary): void {
    const current = this.isEdit ? 'Editar perfil' : 'Novo perfil';
    const suffix = role?.name ? `${current}: ${role.name}` : current;
    this.breadCrumbItems = [
      { label: 'Gestão' },
      { label: 'Perfis' },
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
      if (!control.get('accessLevel')?.value || control.get('accessLevel')?.value === 'none') {
        control.get('accessLevel')?.setValue('read');
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
    const request$ = this.isEdit && this.roleId
      ? this.userManagementService.updateRole(this.roleId, payload)
      : this.userManagementService.createRole(payload);

    request$.pipe(catchError(error => {
      this.feedback = error?.error?.message ?? 'Não foi possível salvar o perfil. Verifique os dados e tente novamente.';
      this.saving = false;
      return of(null);
    })).subscribe(result => {
      if (!result) {
        return;
      }
      this.saving = false;
      this.permissionService.refresh();
      this.router.navigate(['gestao', 'roles']);
    });
  }

  cancel(): void {
    this.router.navigate(['gestao', 'roles']);
  }

  private buildPayload(): SaveRolePayload {
    const value = this.form.value as { name: string; description: string; permissions: PermissionGroupValue[]; };
    const permissions: SavePermissionPayload[] = (value.permissions ?? []).map(permission => ({
      moduleKey: permission.moduleKey,
      hasAccess: permission.hasAccess,
      accessLevel: permission.hasAccess ? permission.accessLevel ?? 'read' : 'none'
    }));

    return {
      id: this.roleId,
      name: value.name,
      description: value.description,
      permissions
    };
  }
}
