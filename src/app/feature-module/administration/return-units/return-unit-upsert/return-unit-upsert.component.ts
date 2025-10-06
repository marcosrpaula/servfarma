import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ReturnUnitsApiService } from '../services/return-units.api.service';
import { LocationsApiService } from '../../../../core/locations/locations.api.service';
import {
  CitySimpleViewModel,
  StateSimpleViewModel,
} from '../../../../shared/models/addresses';
import { LaboratoriesApiService } from '../../laboratories/services/laboratories.api.service';
import { LaboratoryViewModel } from '../../../../shared/models/laboratories';
import { ReturnUnitInput, ReturnUnitViewModel } from '../../../../shared/models/return-units';
import { ReturnUnitsStateService } from '../services/return-units-state.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-return-unit-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './return-unit-upsert.component.html',
  styleUrls: ['./return-unit-upsert.component.scss'],
})
export class ReturnUnitUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(ReturnUnitsApiService);
  private locationsApi = inject(LocationsApiService);
  private labsApi = inject(LaboratoriesApiService);
  private returnUnitsState = inject(ReturnUnitsStateService);
  private notifications = inject(NotificationService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Unidade de Devolucao';
    return this.id() ? 'Editar Unidade de Devolucao' : 'Adicionar Unidade de Devolucao';
  });

  breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Unidades de Devolucao', link: '/return-units' },
    { label: this.title(), active: true },
  ]);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  states: StateSimpleViewModel[] = [];
  cities: CitySimpleViewModel[] = [];
  labs: LaboratoryViewModel[] = [];

  private pendingStateAbbreviation: string | null = null;
  private pendingCityId: string | null = null;

  form: FormGroup = this.fb.group({
    laboratoryId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    legalName: ['', [Validators.required, Validators.maxLength(100)]],
    tradeName: ['', [Validators.required, Validators.maxLength(100)]],
    document: ['', [Validators.required, Validators.maxLength(20)]],
    stateRegistration: ['', [Validators.maxLength(30)]],
    phone: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    observation: ['', [Validators.maxLength(1000)]],
    isActive: [true],
    address: this.fb.group({
      zipCode: ['', [Validators.required, Validators.maxLength(10)]],
      street: ['', [Validators.required, Validators.maxLength(150)]],
      number: ['', [Validators.required, Validators.maxLength(80)]],
      additionalDetails: ['', [Validators.maxLength(150)]],
      referencePoint: ['', [Validators.maxLength(150)]],
      neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
    }),
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);
    this.loadLabs();

    if (this.id()) {
      if (this.isReadOnly()) {
        const unit = this.resolveUnitForReadOnly();
        if (!unit) {
          this.notifications.error('Nao foi possivel carregar os dados da unidade de devolucao para visualizacao. Acesse novamente a partir da listagem.');
          this.router.navigate(['/return-units']);
          return;
        }
        this.bindUnit(unit);
        this.form.disable({ emitEvent: false });
        this.loadStates();
        return;
      }

      this.api.getById(this.id()!).subscribe((unit) => {
        this.bindUnit(unit);
        this.returnUnitsState.upsert(unit);
        this.loadStates();
      });
      return;
    }

    if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
    }
    this.loadStates();
  }

  onStateChange(stateId: string) {
    const state = this.states.find((s) => s.id === stateId);
    if (!state) {
      this.cities = [];
      this.form.get('address.cityId')?.setValue('', { emitEvent: false });
      return;
    }
    this.loadCities(state, true);
  }

  save() {
    if (this.isReadOnly()) return;
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as any;
    const input: ReturnUnitInput = {
      laboratoryId: value.laboratoryId,
      name: value.name,
      legalName: value.legalName,
      tradeName: value.tradeName,
      document: value.document,
      stateRegistration: value.stateRegistration || null,
      phone: value.phone || null,
      email: value.email || null,
      observation: value.observation || null,
      isActive: value.isActive,
      address: {
        zipCode: value.address.zipCode,
        street: value.address.street,
        number: value.address.number,
        additionalDetails: value.address.additionalDetails || null,
        referencePoint: value.address.referencePoint || null,
        neighborhood: value.address.neighborhood,
        cityId: value.address.cityId,
      },
    };

    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/return-units']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar unidade');
    };

    this.isSaving.set(true);
    if (this.id()) {
      this.api.update(this.id()!, input).subscribe({
        next: (updated) => {
          this.returnUnitsState.upsert(updated);
          this.returnUnitsState.updateListItem(updated);
          navigateToList();
        },
        error: failure,
      });
    } else {
      this.api.create(input).subscribe({
        next: () => {
          this.returnUnitsState.clearListState();
          navigateToList();
        },
        error: failure,
      });
    }
  }

  cancel() {
    this.router.navigate(['/return-units']);
  }

  private bindUnit(unit: ReturnUnitViewModel) {
    this.form.patchValue({
      laboratoryId: unit.laboratory?.id ?? '',
      name: unit.name,
      legalName: unit.legalName,
      tradeName: unit.tradeName,
      document: unit.document,
      stateRegistration: unit.stateRegistration ?? '',
      phone: unit.phone ?? '',
      email: unit.email ?? '',
      observation: unit.observation ?? '',
      isActive: unit.isActive ?? true,
    });

    const address = unit.address;
    if (address) {
      this.pendingStateAbbreviation = address.city?.state?.abbreviation ?? null;
      this.pendingCityId = address.city?.id ?? null;
      this.form.get('address')?.patchValue({
        zipCode: address.zipCode,
        street: address.street,
        number: address.number,
        additionalDetails: address.additionalDetails ?? '',
        referencePoint: address.referencePoint ?? '',
        neighborhood: address.neighborhood,
      });
    }
  }

  private loadStates() {
    this.locationsApi
      .listStates({ pageSize: 100, orderBy: 'name', ascending: true })
      .subscribe((res) => {
        this.states = res.items || [];
        if (this.pendingStateAbbreviation) {
          const state = this.states.find(
            (s) => s.abbreviation === this.pendingStateAbbreviation
          );
          if (state) {
            this.form.get('address.stateId')?.setValue(state.id, { emitEvent: false });
            this.loadCities(state, true);
          }
          this.pendingStateAbbreviation = null;
        }
      });
  }

  private loadCities(state: StateSimpleViewModel, preserveSelection = false) {
    this.locationsApi
      .listCities(state.abbreviation, { pageSize: 200, orderBy: 'name', ascending: true })
      .subscribe((res) => {
        this.cities = res.items || [];
        if (preserveSelection && this.pendingCityId) {
          const exists = this.cities.some((c) => c.id === this.pendingCityId);
          if (exists) {
            this.form
              .get('address.cityId')
              ?.setValue(this.pendingCityId, { emitEvent: false });
          }
          this.pendingCityId = null;
        } else {
          this.form.get('address.cityId')?.setValue('', { emitEvent: false });
        }
      });
  }

  private loadLabs() {
    this.labsApi
      .list({ page: 1, pageSize: 100, orderBy: 'trade_name', ascending: true })
      .subscribe((res) => {
        this.labs = res.items || [];
      });
  }

  private resolveUnitForReadOnly(): ReturnUnitViewModel | undefined {
    const fromNavigation = this.getUnitFromNavigationState();
    if (fromNavigation) {
      this.returnUnitsState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.returnUnitsState.getById(this.id());
  }

  private getUnitFromNavigationState(): ReturnUnitViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['returnUnit'] as ReturnUnitViewModel | undefined;
    if (candidate) {
      return this.cloneUnit(candidate);
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['returnUnit'] as ReturnUnitViewModel | undefined;
      if (historyCandidate) {
        return this.cloneUnit(historyCandidate);
      }
    }
    return undefined;
  }

  private cloneUnit(unit: ReturnUnitViewModel): ReturnUnitViewModel {
    return {
      ...unit,
      laboratory: unit.laboratory ? { ...unit.laboratory } : unit.laboratory,
      address: unit.address
        ? {
            ...unit.address,
            city: unit.address.city
              ? {
                  ...unit.address.city,
                  state: unit.address.city.state ? { ...unit.address.city.state } : unit.address.city.state,
                }
              : unit.address.city,
          }
        : unit.address,
    };
  }
}
