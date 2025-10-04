import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  UnitsApiService,
  CreateUnitDto,
  UpdateUnitDto,
} from '../services/units.api.service';
import { UnitsStateService } from '../services/units-state.service';
import { UnitViewModel } from '../../../../shared/models/units';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-unit-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './unit-upsert.component.html',
  styleUrls: ['./unit-upsert.component.scss'],
})
export class UnitUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(UnitsApiService);
  private unitsState = inject(UnitsStateService);
  private notifications = inject(NotificationService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Unidade';
    return this.id() ? 'Editar Unidade' : 'Adicionar Unidade';
  });

  breadCrumbItems = computed(() => [
    { label: 'Catalogos' },
    { label: 'Unidades', link: '/units' },
    { label: this.title(), active: true },
  ]);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);

    if (this.id()) {
      if (this.isReadOnly()) {
        const unit = this.resolveUnitForReadOnly();
        if (!unit) {
          this.notifications.error('Nao foi possivel carregar os dados da unidade para visualizacao. Acesse novamente a partir da listagem.');
          this.router.navigate(['/units']);
          return;
        }
        this.patchForm(unit);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.api.getById(this.id()!).subscribe((unit) => {
        this.patchForm(unit);
        this.unitsState.upsert(unit);
      });
    } else if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
    }
  }

  save(): void {
    if (this.isReadOnly()) {
      return;
    }
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as { name: string; isActive: boolean };
    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/units']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar unidade');
    };

    this.isSaving.set(true);
    if (this.id()) {
      const dto: UpdateUnitDto = {
        name: value.name,
        isActive: value.isActive,
      };
      this.api.update(this.id()!, dto).subscribe({
        next: (updated) => {
          this.unitsState.upsert(updated);
          this.unitsState.updateListItem(updated);
          navigateToList();
        },
        error: failure,
      });
    } else {
      const dto: CreateUnitDto = {
        name: value.name,
        isActive: value.isActive,
      };
      this.api.create(dto).subscribe({
        next: () => {
          this.unitsState.clearListState();
          navigateToList();
        },
        error: failure,
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/units']);
  }

  private patchForm(unit: Pick<UnitViewModel, 'name' | 'isActive'>) {
    this.form.patchValue({
      name: unit?.name ?? '',
      isActive: unit?.isActive ?? true,
    });
  }

  private resolveUnitForReadOnly(): UnitViewModel | undefined {
    const fromNavigation = this.getUnitFromNavigationState();
    if (fromNavigation) {
      this.unitsState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.unitsState.getById(this.id());
  }

  private getUnitFromNavigationState(): UnitViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['unit'] as UnitViewModel | undefined;
    if (candidate) {
      return { ...candidate };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['unit'] as UnitViewModel | undefined;
      if (historyCandidate) {
        return { ...historyCandidate };
      }
    }
    return undefined;
  }
}
