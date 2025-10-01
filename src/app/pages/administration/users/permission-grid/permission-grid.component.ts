import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

interface PermissionViewModel {
  label: string;
  description?: string;
  control: FormGroup;
}

interface PermissionGroupViewModel {
  key: string;
  permissions: PermissionViewModel[];
}

@Component({
  selector: 'app-permission-grid',
  templateUrl: './permission-grid.component.html',
  styleUrls: ['./permission-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PermissionGridComponent {
  @Input() permissionsForm?: FormArray;
  @Input() loading = false;

  get groups(): PermissionGroupViewModel[] {
    if (!this.permissionsForm) {
      return [];
    }

    const grouped = new Map<string, PermissionGroupViewModel>();

    this.permissionsForm.controls.forEach((control) => {
      const group = control.get('category')?.value || this.extractCategory(control.get('directive')?.value);
      const key = group || 'Geral';
      if (!grouped.has(key)) {
        grouped.set(key, { key, permissions: [] });
      }
      grouped.get(key)?.permissions.push({
        label: control.get('label')?.value || control.get('directive')?.value,
        description: control.get('description')?.value,
        control: control as FormGroup,
      });
    });

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      permissions: group.permissions.sort((a, b) => a.label.localeCompare(b.label)),
    }));
  }

  trackByGroup(_: number, item: PermissionGroupViewModel): string {
    return item.key;
  }

  trackByPermission(_: number, item: PermissionViewModel): string {
    return item.control.get('id')?.value ?? item.label;
  }

  getCheckedControl(permission: PermissionViewModel): FormControl {
    return permission.control.get('checked') as FormControl;
  }

  private extractCategory(directive: string | undefined): string | undefined {
    if (!directive) {
      return undefined;
    }
    if (!directive.includes(':')) {
      return undefined;
    }
    return directive.split(':')[0];
  }
}
