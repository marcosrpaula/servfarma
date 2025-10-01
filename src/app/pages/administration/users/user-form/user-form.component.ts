import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PermissionDirective } from 'src/app/core/models/permission.model';
import { Role } from 'src/app/core/models/role.model';
import {
  CreateUserPayload,
  UpdateUserPayload,
  UserAccount,
  UserStatus,
} from 'src/app/core/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UserFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() roles: Role[] = [];
  @Input() permissionsCatalog: PermissionDirective[] = [];
  @Input() loading = false;
  @Input() initialValue?: UserAccount;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() submissionError: string | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateUserPayload | UpdateUserPayload>();

  form!: FormGroup;
  private subscription = new Subscription();

  get permissionsArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  get isEditMode(): boolean {
    return this.mode === 'edit' || !!this.initialValue?.id;
  }

  get availablePermissions(): PermissionDirective[] {
    if (this.permissionsCatalog?.length) {
      return this.permissionsCatalog;
    }
    const map = new Map<string, PermissionDirective>();
    this.roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        if (!map.has(permission.id)) {
          map.set(permission.id, permission);
        }
      });
    });
    return Array.from(map.values());
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.rebuildPermissions();
    this.subscription.add(
      this.form
        .get('roleIds')
        ?.valueChanges.subscribe((roleIds: string[]) => this.syncPermissionsWithRoles(roleIds)) ?? new Subscription()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) {
      return;
    }

    if (changes['initialValue'] && this.initialValue) {
      this.patchForm(this.initialValue);
    }

    if (changes['roles'] || changes['permissionsCatalog']) {
      this.rebuildPermissions();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const permissionIds = this.permissionsArray.controls
      .filter((control) => control.get('checked')?.value)
      .map((control) => control.get('id')?.value || control.get('directive')?.value)
      .filter((value): value is string => !!value);

    const basePayload = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      document: formValue.document,
      phone: formValue.phone,
      status: formValue.status as UserStatus,
      roleIds: formValue.roleIds,
      permissionIds,
    };

    if (this.isEditMode && this.initialValue) {
      const payload: UpdateUserPayload = {
        id: this.initialValue.id,
        ...basePayload,
      };
      if (formValue.password) {
        payload.password = formValue.password;
      }
      this.save.emit(payload);
      return;
    }

    const payload: CreateUserPayload = {
      ...basePayload,
      password: formValue.password,
    };
    this.save.emit(payload);
  }

  cancelForm(): void {
    this.cancel.emit();
  }

  private buildForm(): void {
    const status = this.initialValue?.status ?? 'active';
    const roleIds = this.initialValue?.roles?.map((role) => role.id) ?? [];
    this.form = this.fb.group({
      firstName: [this.initialValue?.firstName ?? '', [Validators.required]],
      lastName: [this.initialValue?.lastName ?? '', [Validators.required]],
      email: [this.initialValue?.email ?? '', [Validators.required, Validators.email]],
      document: [this.initialValue?.document ?? ''],
      phone: [this.initialValue?.phone ?? ''],
      status: [status, [Validators.required]],
      roleIds: [roleIds, [Validators.required]],
      password: [
        '',
        this.isEditMode
          ? []
          : [Validators.required, Validators.minLength(6)],
      ],
      permissions: this.fb.array([]),
    });
  }

  private rebuildPermissions(): void {
    const permissions = this.availablePermissions;
    const selectedDirectives = this.getSelectedPermissions();
    this.permissionsArray.clear();
    permissions.forEach((permission) => {
      this.permissionsArray.push(
        this.fb.group({
          id: [permission.id],
          directive: [permission.directive],
          label: [permission.label],
          description: [permission.description],
          category: [permission.category],
          checked: [
            selectedDirectives.has(permission.id) || selectedDirectives.has(permission.directive),
          ],
        })
      );
    });
    const roleIds = this.form?.get('roleIds')?.value as string[];
    if (roleIds?.length) {
      this.syncPermissionsWithRoles(roleIds, true);
    }
  }

  private getSelectedPermissions(): Set<string> {
    if (this.permissionsArray.length > 0) {
      const selected = new Set<string>();
      this.permissionsArray.controls.forEach((control) => {
        if (control.get('checked')?.value) {
          const id = control.get('id')?.value;
          const directive = control.get('directive')?.value;
          if (id) {
            selected.add(id);
          }
          if (directive) {
            selected.add(directive);
          }
        }
      });
      return selected;
    }

    const fromInitial = new Set<string>();
    this.initialValue?.permissions?.forEach((permission) => {
      if (permission.id) {
        fromInitial.add(permission.id);
      }
      if (permission.directive) {
        fromInitial.add(permission.directive);
      }
    });
    this.initialValue?.directives?.forEach((directive) => {
      fromInitial.add(directive);
    });
    return fromInitial;
  }

  private patchForm(user: UserAccount): void {
    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      document: user.document,
      phone: user.phone,
      status: user.status,
      roleIds: user.roles?.map((role) => role.id) ?? [],
    });
    this.rebuildPermissions();
  }

  private syncPermissionsWithRoles(roleIds: string[], preserveExisting = false): void {
    const permissionsToCheck = new Set<string>();
    roleIds.forEach((id) => {
      const role = this.roles.find((item) => item.id === id);
      role?.permissions?.forEach((permission) => {
        permissionsToCheck.add(permission.id);
        permissionsToCheck.add(permission.directive);
      });
    });

    this.permissionsArray.controls.forEach((control) => {
      const id = control.get('id')?.value;
      const directive = control.get('directive')?.value;
      const shouldBeChecked = permissionsToCheck.has(id) || permissionsToCheck.has(directive);
      if (shouldBeChecked) {
        control.get('checked')?.setValue(true, { emitEvent: false });
      } else if (!preserveExisting && !this.isEditMode) {
        control.get('checked')?.setValue(false, { emitEvent: false });
      }
    });
  }
}
