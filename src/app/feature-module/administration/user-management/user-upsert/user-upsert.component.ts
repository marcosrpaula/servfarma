import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import { LoadingOverlayComponent } from '../../../../shared/common/loading-overlay/loading-overlay.component';
import { RoleViewModel } from '../../../../shared/models/users';
import { SharedModule } from '../../../../shared/shared.module';
import { createLoadingTracker } from '../../../../shared/utils/loading-tracker';
import { RolesApiService } from '../services/roles.api.service';
import { CreateUserDto, UpdateUserDto, UsersApiService } from '../services/users.api.service';

@Component({
  selector: 'app-user-upsert',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    LoadingOverlayComponent,
  ],
  providers: [RolesApiService],
  templateUrl: './user-upsert.component.html',
})
export class UserUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(UsersApiService);
  private rolesApi = inject(RolesApiService);
  private cdr = inject(ChangeDetectorRef);
  private globalLoader = inject(GlobalLoaderService);

  id = signal<string | null>(null);
  title = computed(() => (this.id() ? 'Editar UsuÃ¡rio' : 'Adicionar UsuÃ¡rio'));
  breadCrumbItems = computed(() => [
    { label: 'Administração' },
    { label: 'Usuários', link: '/user-management/users' },
    { label: this.title(), active: true },
  ]);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadingTracker = createLoadingTracker();
  readonly isLoading = this.loadingTracker.isLoading;
  readonly isBusy = computed(() => this.isSaving() || this.loadingTracker.isLoading());
  readonly loadingMessage = computed(() => {
    if (this.isSaving()) {
      return this.id() ? 'Atualizando usuário...' : 'Salvando usuário...';
    }
    if (this.loadingTracker.isLoading()) {
      return this.id() ? 'Carregando dados do usuário...' : 'Carregando permissões disponíveis...';
    }
    return 'Processando...';
  });

  roles: Array<{ id: string; name: string }> = [];

  permissionGroups: Array<{
    module: string;
    readId?: string;
    writeId?: string;
  }> = [];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],

    isActive: [true],
    permissions: this.fb.array([] as any[]),
  });

  get permissionsArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }
  trackByIdx = (_: number, __: any) => _;

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));

    this.loadingTracker
      .track(
        this.globalLoader.track(
          this.rolesApi.list({ page: 1, pageSize: 200, orderBy: 'name', ascending: true }),
        ),
      )
      .subscribe({
        next: ({ items }) => {
          const groups = new Map<string, { readId?: string; writeId?: string }>();
          for (const r of items) {
            const [mod, action] = (r.name || '').split(':');
            if (!mod || !action) continue;
            const g = groups.get(mod) ?? {};
            if (action.toLowerCase() === 'read') g.readId = r.id;
            if (action.toLowerCase() === 'admin' || action.toLowerCase() === 'write')
              g.writeId = r.id;
            groups.set(mod, g);
          }
          this.permissionGroups = Array.from(groups.entries())
            .map(([module, v]) => ({ module, ...v }))
            .sort((a, b) => a.module.localeCompare(b.module));

          const controls = this.permissionGroups.map((pg) =>
            this.fb.group(
              {
                module: [pg.module],
                enabled: [false],
                level: [''],
              },
              { validators: [this.requireLevelWhenEnabled()] },
            ),
          );
          const arr = this.fb.array(controls, [this.requireAtLeastOnePermission()]);
          this.form.setControl('permissions', arr);

          if (this.id()) this.load(this.id()!);

          this.cdr.detectChanges();
        },
        error: () => {
          const message =
            'Não foi possível carregar as permissões. Atualize a página e tente novamente.';
          this.errorMessage.set(message);
        },
      });
  }

  private load(id: string) {
    this.loadingTracker.track(this.globalLoader.track(this.api.getById(id))).subscribe({
      next: (u: any) => {
        this.form.patchValue({
          name: u.name ?? '',
          email: u.email ?? '',
          isActive: u.isActive ?? true,
        });

        // Marca checkboxes de acordo com as roles do usuário
        if (Array.isArray(u.permissions)) {
          const userRoleNames: string[] = u.permissions
            .map((p: RoleViewModel) => p?.name)
            .filter(Boolean);
          this.permissionGroups.forEach((pg, i) => {
            const group = this.permissionsArray.at(i) as FormGroup;
            const hasRead = userRoleNames.some((n) => n === `${pg.module}:read`);
            const hasWrite = userRoleNames.some(
              (n) => n === `${pg.module}:admin` || n === `${pg.module}:write`,
            );
            if (hasWrite) group.get('level')?.setValue('write', { emitEvent: false });
            else if (hasRead) group.get('level')?.setValue('read', { emitEvent: false });

            const enabled = hasRead || hasWrite;
            group.get('enabled')?.setValue(enabled, { emitEvent: false });
          });

          // garante atualização da marcação na view
          this.cdr.detectChanges();
        }
      },
      error: () => {
        const message =
          'Não foi possível carregar os dados do usuário. Volte para a listagem e tente novamente.';
        this.errorMessage.set(message);
        this.router.navigate(['/user-management/users']);
      },
    });
  }

  save() {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.permissionsArray.markAllAsTouched();
      return;
    }

    const v = this.form.value as any;
    const permissions = this.buildPermissionIds();

    const done = () => {
      this.isSaving.set(false);
      this.router.navigate(['/user-management/users']);
    };
    const fail = (e: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(e?.error?.message ?? 'Save error');
    };

    this.isSaving.set(true);
    if (this.id()) {
      const dto: UpdateUserDto = {
        name: v.name,
        permissions,
        isActive: v.isActive,
      };
      this.loadingTracker
        .track(this.globalLoader.track(this.api.update(this.id()!, dto)))
        .subscribe({ next: done, error: fail });
    } else {
      const dto: CreateUserDto = {
        name: v.name,
        email: v.email,
        permissions,
        isActive: v.isActive,
      };
      this.loadingTracker
        .track(this.globalLoader.track(this.api.create(dto)))
        .subscribe({ next: done, error: fail });
    }
  }

  cancel() {
    this.router.navigate(['/user-management/users']);
  }

  private buildPermissionIds(): string[] {
    const list: string[] = [];
    for (let i = 0; i < this.permissionsArray.length; i++) {
      const group = this.permissionsArray.at(i) as FormGroup;
      const pg = this.permissionGroups[i];
      if (!pg) continue;
      const enabled = !!group.get('enabled')?.value;
      const level = group.get('level')?.value as 'read' | 'write' | '';
      if (!enabled) continue;
      if (level === 'read' && pg.readId) list.push(pg.readId);
      if (level === 'write' && pg.writeId) list.push(pg.writeId);
    }
    return list;
  }

  private requireAtLeastOnePermission(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      const hasOne = arr.controls.some((c) => {
        const v = (c as FormGroup).get('level')?.value;
        return v === 'read' || v === 'write';
      });
      return hasOne ? null : { permissionsRequired: true };
    };
  }

  // permite desmarcar o rÃÂ¡dio ao clicar novamente
  toggleLevel(index: number, level: 'read' | 'write', event: Event) {
    const group = this.permissionsArray.at(index) as FormGroup;
    if (!group.get('enabled')?.value) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const ctrl = group.get('level');
    ctrl?.setValue(level, { emitEvent: true });
  }

  toggleEnabled(index: number, checked: boolean) {
    const group = this.permissionsArray.at(index) as FormGroup;
    group.get('enabled')?.setValue(checked, { emitEvent: true });
    if (!checked) {
      group.get('level')?.setValue('', { emitEvent: true });
    }
  }

  isEnabled(index: number): boolean {
    const group = this.permissionsArray.at(index) as FormGroup;
    return !!group?.get('enabled')?.value;
  }

  private requireLevelWhenEnabled(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const enabled = !!group.get('enabled')?.value;
      const level = group.get('level')?.value as string;
      if (enabled && !level) return { levelRequired: true };
      return null;
    };
  }
}
