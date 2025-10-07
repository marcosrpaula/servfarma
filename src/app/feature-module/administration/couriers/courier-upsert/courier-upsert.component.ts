import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationsApiService } from '../../../../core/locations/locations.api.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import {
  CitySimpleViewModel,
  CityViewModel,
  StateSimpleViewModel,
} from '../../../../shared/models/addresses';
import {
  CourierCompanySimpleViewModel,
  CourierInput,
  CourierViewModel,
  CourierWithCitiesViewModel,
  ServedCityInput,
} from '../../../../shared/models/couriers';
import { LoadingOverlayComponent } from '../../../../shared/common/loading-overlay/loading-overlay.component';
import { SharedModule } from '../../../../shared/shared.module';
import { createLoadingTracker } from '../../../../shared/utils/loading-tracker';
import { CourierCompaniesApiService } from '../../courier-companies/services/courier-companies.api.service';
import { CouriersStateService } from '../services/couriers-state.service';
import { CouriersApiService } from '../services/couriers.api.service';
const requireAtLeastOneSelection = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (Array.isArray(value)) {
    return value.length > 0 ? null : { required: true };
  }
  return value ? null : { required: true };
};

@Component({
  selector: 'app-courier-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, LoadingOverlayComponent],
  templateUrl: './courier-upsert.component.html',
})
export class CourierUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(CouriersApiService);
  private state = inject(CouriersStateService);
  private courierCompaniesApi = inject(CourierCompaniesApiService);
  private locationsApi = inject(LocationsApiService);
  private notifications = inject(NotificationService);
  private globalLoader = inject(GlobalLoaderService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Entregador';
    return this.id() ? 'Editar Entregador' : 'Adicionar Entregador';
  });

  breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Entregadores', link: '/couriers' },
    { label: this.title(), active: true },
  ]);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadingTracker = createLoadingTracker();
  readonly isLoading = this.loadingTracker.isLoading;
  readonly isBusy = computed(() => this.isSaving() || this.loadingTracker.isLoading());
  readonly loadingMessage = computed(() => {
    if (this.isSaving()) {
      return this.id() ? 'Atualizando entregador...' : 'Salvando entregador...';
    }
    if (this.loadingTracker.isLoading()) {
      return this.id()
        ? 'Carregando dados do entregador...'
        : 'Carregando recursos do entregador...';
    }
    return 'Processando...';
  });

  states: StateSimpleViewModel[] = [];
  cities: CitySimpleViewModel[] = [];
  companyOptions: CourierCompanySimpleViewModel[] = [];

  servedCities: CityViewModel[] = [];
  citySelectorCities: CitySimpleViewModel[] = [];

  citySelector = this.fb.group({
    stateId: [''],
    cityId: [''],
  });

  private pendingAddressStateAbbreviation: string | null = null;
  private pendingAddressCityId: string | null = null;

  private pendingLoadComplete = false;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    legalName: ['', [Validators.required, Validators.maxLength(120)]],
    tradeName: ['', [Validators.required, Validators.maxLength(120)]],
    document: ['', [Validators.required, Validators.maxLength(20)]],
    stateRegistration: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.maxLength(20)]],
    code: ['', [Validators.maxLength(50)]],
    observation: ['', [Validators.maxLength(500)]],
    adValoremRate: ['', []],
    adValoremMinGoodsValue: ['', []],
    courierCompanyIds: [[], [requireAtLeastOneSelection]],
    isActive: [true],
    address: this.fb.group({
      zipCode: ['', [Validators.required, Validators.maxLength(10)]],
      street: ['', [Validators.required, Validators.maxLength(150)]],
      number: ['', [Validators.required, Validators.maxLength(30)]],
      additionalDetails: ['', [Validators.maxLength(120)]],
      referencePoint: ['', [Validators.maxLength(120)]],
      neighborhood: ['', [Validators.required, Validators.maxLength(120)]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
    }),
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);
    this.loadStates();
    this.loadCompanies();

    if (this.id()) {
      if (this.isReadOnly()) {
        const courier = this.resolveCourierForReadOnly();
        if (!courier) {
          this.notifications.error(
            'Nao foi possivel carregar os dados do entregador para visualizacao. Abra novamente a partir da listagem.',
          );
          this.router.navigate(['/couriers']);
          return;
        }
        this.applyCourier(courier);
        this.form.disable({ emitEvent: false });
        this.citySelector.disable({ emitEvent: false });
      } else {
        this.fetchCourier();
      }
    } else if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
      this.citySelector.disable({ emitEvent: false });
    }

    this.citySelector.get('stateId')?.valueChanges.subscribe((stateId) => {
      if (!stateId) {
        this.citySelectorCities = [];
        this.citySelector.get('cityId')?.setValue('', { emitEvent: false });
        return;
      }
      const state = this.states.find((s) => s.id === stateId);
      if (state) {
        this.globalLoader
          .track(this.locationsApi.listCities(state.abbreviation, { pageSize: 200, orderBy: 'name', ascending: true }))
          .subscribe({
            next: (res) => {
              this.citySelectorCities = res.items || [];
              this.citySelector.get('cityId')?.setValue('', { emitEvent: false });
            },
            error: () => {
              this.notifications.error('Não foi possível carregar as cidades disponíveis.');
            },
          });
      }
    });
  }

  onAddressStateChange(stateId: string) {
    const state = this.states.find((s) => s.id === stateId);
    if (!state) {
      this.cities = [];
      this.form.get('address.cityId')?.setValue('', { emitEvent: false });
      return;
    }
    this.loadAddressCities(state, true);
  }

  addServedCity() {
    if (this.isReadOnly()) return;
    const stateId = this.citySelector.get('stateId')?.value;
    const cityId = this.citySelector.get('cityId')?.value;
    if (!stateId || !cityId || !this.id()) return;

    const payload: ServedCityInput = { cityIds: [cityId] };
    this.globalLoader
      .track(this.api.addServedCities(this.id()!, payload))
      .subscribe({
        next: (courier) => {
          this.updateServedCities(courier as CourierWithCitiesViewModel);
          this.citySelector.reset();
          this.citySelectorCities = [];
        },
        error: () => {
          this.notifications.error('Não foi possível adicionar a cidade atendida.');
        },
      });
  }

  removeServedCity(cityId: string) {
    if (this.isReadOnly() || !this.id()) return;
    const payload: ServedCityInput = { cityIds: [cityId] };
    this.globalLoader
      .track(this.api.removeServedCities(this.id()!, payload))
      .subscribe({
        next: (courier) => {
          this.updateServedCities(courier as CourierWithCitiesViewModel);
        },
        error: () => {
          this.notifications.error('Não foi possível remover a cidade atendida.');
        },
      });
  }

  save() {
    if (this.isReadOnly()) {
      return;
    }
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as any;
    const adValoremRate = value.adValoremRate;
    const adValoremMin = value.adValoremMinGoodsValue;
    const companiesControl = this.form.get('courierCompanyIds');
    const courierCompanyIds: string[] = Array.isArray(value.courierCompanyIds)
      ? value.courierCompanyIds.filter((id: string) => !!id).map((id: string) => String(id))
      : value.courierCompanyIds
        ? [String(value.courierCompanyIds)]
        : [];

    if (!courierCompanyIds.length) {
      companiesControl?.setErrors({ required: true });
      companiesControl?.markAsTouched({ onlySelf: true });
      return;
    }

    const input: CourierInput = {
      name: value.name,
      legalName: value.legalName,
      tradeName: value.tradeName,
      document: value.document,
      stateRegistration: value.stateRegistration || null,
      email: value.email || null,
      phone: value.phone || null,
      code: value.code || null,
      observation: value.observation || null,
      adValoremRule:
        adValoremRate !== null &&
        adValoremRate !== '' &&
        adValoremMin !== null &&
        adValoremMin !== ''
          ? {
              rate: Number(adValoremRate),
              minGoodsValue: Number(adValoremMin),
            }
          : null,
      courierCompanyIds,

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
      this.router.navigate(['/couriers']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar entregador');
    };

    this.isSaving.set(true);
    if (this.id()) {
      this.globalLoader
        .track(this.api.update(this.id()!, input))
        .subscribe({
          next: (updated) => {
            this.state.upsert(updated);
            this.state.updateListItem(updated);
            this.updateServedCities(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      this.globalLoader
        .track(this.api.create(input))
        .subscribe({
          next: () => {
            this.state.clearListState();
            navigateToList();
          },
          error: failure,
        });
    }
  }

  cancel() {
    this.router.navigate(['/couriers']);
  }

  private fetchCourier() {
    if (!this.id()) return;
    this.globalLoader
      .track(this.api.getById(this.id()!))
      .subscribe({
        next: (courier) => {
          this.state.upsert(courier);
          this.applyCourier(courier);
          if (this.isReadOnly()) {
            this.form.disable({ emitEvent: false });
            this.citySelector.disable({ emitEvent: false });
          }
        },
        error: () => {
          const message = 'Não foi possível carregar os dados do entregador. Volte para a listagem.';
          this.notifications.error(message);
          this.router.navigate(['/couriers']);
        },
      });
  }

  private applyCourier(courier: CourierViewModel | CourierWithCitiesViewModel): void {
    this.form.patchValue({
      name: courier.name ?? '',
      legalName: courier.legalName ?? '',
      tradeName: courier.tradeName ?? '',
      document: courier.document ?? '',
      stateRegistration: courier.stateRegistration ?? '',
      email: courier.email ?? '',
      phone: courier.phone ?? '',
      code: courier.code ?? '',
      observation: courier.observation ?? '',
      adValoremRate: courier.adValoremRule?.rate ?? '',
      adValoremMinGoodsValue: courier.adValoremRule?.minGoodsValue ?? '',
      courierCompanyIds: courier.courierCompanies?.map((c) => c.id) ?? [],
      isActive: courier.isActive ?? true,
    });

    const address = courier.address;
    if (address) {
      this.pendingAddressStateAbbreviation = address.city?.state?.abbreviation ?? null;
      this.pendingAddressCityId = address.city?.id ?? null;
      this.form.get('address')?.patchValue(
        {
          zipCode: address.zipCode ?? '',
          street: address.street ?? '',
          number: address.number ?? '',
          additionalDetails: address.additionalDetails ?? '',
          referencePoint: address.referencePoint ?? '',
          neighborhood: address.neighborhood ?? '',
        },
        { emitEvent: false },
      );
      this.applyPendingAddressSelection();
    } else {
      this.pendingAddressStateAbbreviation = null;
      this.pendingAddressCityId = null;
      this.form.get('address')?.patchValue(
        {
          zipCode: '',
          street: '',
          number: '',
          additionalDetails: '',
          referencePoint: '',
          neighborhood: '',
        },
        { emitEvent: false },
      );
      this.form.get('address.stateId')?.setValue('', { emitEvent: false });
      this.form.get('address.cityId')?.setValue('', { emitEvent: false });
    }

    this.updateServedCities(courier as CourierWithCitiesViewModel);
  }

  private resolveCourierForReadOnly(): CourierViewModel | undefined {
    const fromNavigation = this.getCourierFromNavigationState();
    if (fromNavigation) {
      this.state.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.state.getById(this.id());
  }

  private getCourierFromNavigationState(): CourierViewModel | undefined {
    const navigation = this.router.getCurrentNavigation();
    const fromNavigation = navigation?.extras?.state?.['courier'] as CourierViewModel | undefined;
    if (fromNavigation) {
      return { ...fromNavigation };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const candidate = (history.state as Record<string, unknown>)['courier'] as
        | CourierViewModel
        | undefined;
      if (candidate) {
        return { ...candidate };
      }
    }
    return undefined;
  }

  private applyPendingAddressSelection(): void {
    if (!this.pendingAddressStateAbbreviation) {
      return;
    }
    if (!this.states || this.states.length === 0) {
      return;
    }
    const matching = this.states.find(
      (s) => s.abbreviation === this.pendingAddressStateAbbreviation,
    );
    if (matching) {
      this.form.get('address.stateId')?.setValue(matching.id, { emitEvent: false });
      this.loadAddressCities(matching, true);
    }
    this.pendingAddressStateAbbreviation = null;
  }

  private loadStates() {
    this.globalLoader
      .track(this.locationsApi.listStates({ pageSize: 100, orderBy: 'name', ascending: true }))
      .subscribe({
        next: (res) => {
          this.states = res.items || [];
          if (this.pendingAddressStateAbbreviation) {
            const state = this.states.find(
              (s) => s.abbreviation === this.pendingAddressStateAbbreviation,
            );
            if (state) {
              this.form.get('address.stateId')?.setValue(state.id, { emitEvent: false });
              this.loadAddressCities(state, true);
            }
            this.pendingAddressStateAbbreviation = null;
          }
        },
        error: () => {
          this.notifications.error('Não foi possível carregar os estados.');
        },
      });
  }

  private loadAddressCities(state: StateSimpleViewModel, preserveSelection = false) {
    this.globalLoader
      .track(this.locationsApi.listCities(state.abbreviation, { pageSize: 200, orderBy: 'name', ascending: true }))
      .subscribe({
        next: (res) => {
          this.cities = res.items || [];
          if (preserveSelection && this.pendingAddressCityId) {
            const exists = this.cities.some((c) => c.id === this.pendingAddressCityId);
            if (exists) {
              this.form
                .get('address.cityId')
                ?.setValue(this.pendingAddressCityId, { emitEvent: false });
            }
            this.pendingAddressCityId = null;
          } else {
            this.form.get('address.cityId')?.setValue('', { emitEvent: false });
          }
        },
        error: () => {
          this.notifications.error('Não foi possível carregar as cidades do endereço.');
        },
      });
  }

  private updateServedCities(courier: CourierWithCitiesViewModel) {
    this.servedCities = courier.servedCities || [];
  }

  private loadCompanies() {
    this.globalLoader
      .track(this.courierCompaniesApi.list({ page: 1, pageSize: 100, orderBy: 'name', ascending: true }))
      .subscribe({
        next: (res) => {
          this.companyOptions = res.items || [];
        },
        error: () => {
          this.notifications.error('Não foi possível carregar as transportadoras disponíveis.');
        },
      });
  }
}
