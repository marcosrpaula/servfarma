import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ValidationErrorEntry } from '../../core/notifications/notification.service';

type ControlEntry = {
  path: string;
  control: AbstractControl;
  normalized: string;
};

export function applyServerValidationErrors(
  form: FormGroup,
  entries: ValidationErrorEntry[] | undefined | null,
): string[] {
  if (!form || !entries || entries.length === 0) {
    return [];
  }

  const controls = flattenControls(form);
  const unmatchedMessages: string[] = [];

  entries.forEach((entry) => {
    const controlEntry = resolveControlForField(entry.field, controls);
    const joinedMessage = entry.messages.join(' ');

    if (controlEntry) {
      const existing = controlEntry.control.errors ?? {};
      controlEntry.control.setErrors({ ...existing, server: joinedMessage });
      controlEntry.control.markAsDirty();
      controlEntry.control.markAsTouched();
      controlEntry.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    } else {
      unmatchedMessages.push(joinedMessage);
    }
  });

  if (unmatchedMessages.length) {
    const existing = form.errors ?? {};
    form.setErrors({ ...existing, server: unmatchedMessages.join(' ') });
  }

  return unmatchedMessages;
}

function flattenControls(control: AbstractControl, path = ''): ControlEntry[] {
  if (control instanceof FormGroup) {
    return Object.entries(control.controls).flatMap(([key, child]) =>
      flattenControls(child, path ? `${path}.${key}` : key),
    );
  }

  if (control instanceof FormArray) {
    return control.controls.flatMap((child, index) => flattenControls(child, `${path}[${index}]`));
  }

  const fieldName = path.split('.').pop() ?? path;
  return [
    {
      path,
      control,
      normalized: normalizeKey(fieldName),
    },
  ];
}

function resolveControlForField(field: string, controls: ControlEntry[]): ControlEntry | undefined {
  if (!field) {
    return undefined;
  }

  const normalizedField = normalizeKey(field.split('.').pop() ?? field);

  let match = controls.find((control) => control.normalized === normalizedField);
  if (match) {
    return match;
  }

  match = controls.find((control) => normalizedField.endsWith(control.normalized));
  if (match) {
    return match;
  }

  return undefined;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .join('');
}
