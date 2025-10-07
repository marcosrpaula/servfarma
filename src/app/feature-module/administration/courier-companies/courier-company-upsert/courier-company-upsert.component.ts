import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationsApiService } from '../../../../core/locations/locations.api.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import { LoadingOverlayComponent } from '../../../../shared/common/loading-overlay/loading-overlay.component';
import { CitySimpleViewModel, StateSimpleViewModel } from '../../../../shared/models/addresses';
import {
  CourierCompanyInput,
  CourierCompanyViewModel,
} from '../../../../shared/models/courier-companies';
import { SharedModule } from '../../../../shared/shared.module';
import { createLoadingTracker } from '../../../../shared/utils/loading-tracker';
import { CourierCompaniesStateService } from '../services/courier-companies-state.service';
import { CourierCompaniesApiService } from '../services/courier-companies.api.service';

@Component({
  selector: 'app-courier-company-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, LoadingOverlayComponent],
  templateUrl: './courier-company-upsert.component.html',
  styleUrls: ['./courier-company-upsert.component.scss'],
})
export class CourierCompanyUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(CourierCompaniesApiService);
  private state = inject(CourierCompaniesStateService);
  private locationsApi = inject(LocationsApiService);
  private notifications = inject(NotificationService);
  private globalLoader = inject(GlobalLoaderService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Transportadora';
    return this.id() ? 'Editar Transportadora' : 'Adicionar Transportadora';
  });

  breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Transportadoras', link: '/courier-companies' },
    { label: this.title(), active: true },
  ]);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadingTracker = createLoadingTracker();
  readonly isLoading = this.loadingTracker.isLoading;
  readonly isBusy = computed(() => this.isSaving() || this.loadingTracker.isLoading());
  readonly loadingMessage = computed(() => {
    if (this.isSaving()) {
      return this.id() ? 'Atualizando transportadora...' : 'Salvando transportadora...';
    }
    if (this.loadingTracker.isLoading()) {
      return this.id()
        ? 'Carregando dados da transportadora...'
        : 'Carregando recursos da transportadora...';
    }
    return 'Processando...';
  });

  states: StateSimpleViewModel[] = [];
  cities: CitySimpleViewModel[] = [];

  private pendingStateAbbreviation: string | null = null;
  private pendingCityId: string | null = null;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    legalName: ['', [Validators.maxLength(120)]],
    document: ['', [Validators.maxLength(20)]],
    stateRegistration: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    observation: ['', [Validators.maxLength(500)]],
    printOnInvoice: [false],
    isActive: [true],
    address: this.fb.group({
      zipCode: ['', [Validators.maxLength(10)]],
      street: ['', [Validators.maxLength(150)]],
      number: ['', [Validators.maxLength(30)]],
      additionalDetails: ['', [Validators.maxLength(120)]],
      referencePoint: ['', [Validators.maxLength(120)]],
      neighborhood: ['', [Validators.maxLength(120)]],
      stateId: ['', []],
      cityId: ['', []],
    }),
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);
    this.loadStates();

    if (this.id()) {
      if (this.isReadOnly()) {
        const company = this.resolveCompanyForReadOnly();
        if (!company) {
          this.notifications.error(
            'Nao foi possivel carregar os dados da transportadora para visualizacao. Abra novamente a partir da listagem.',
          );
          this.router.navigate(['/courier-companies']);
          return;
        }
        this.applyCompany(company);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.loadingTracker.track(this.globalLoader.track(this.api.getById(this.id()!))).subscribe({
        next: (company) => {
          this.applyCompany(company);
          this.state.upsert(company);
        },
        error: () => {
          const message =
            'Não foi possível carregar os dados da transportadora. Tente novamente a partir da listagem.';
          this.errorMessage.set(message);
          this.notifications.error(message);
          this.router.navigate(['/courier-companies']);
        },
      });
    } else if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
    }
  }

  onStateChange(stateId: string) {
    const state = this.states.find((s) => s.id === stateId);
    if (!state) {
      this.cities = [];
      this.form.get('address.cityId')?.setValue('', { emitEvent: false });
      return;
    }
    this.loadCities(state);
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

    const value = this.form.value as {
      name: string;
      legalName?: string | null;
      document?: string | null;
      stateRegistration?: string | null;
      email?: string | null;
      observation?: string | null;
      printOnInvoice: boolean;
      isActive: boolean;
      address: any;
    };

    const addressValue = value.address;
    const hasAddress =
      addressValue &&
      addressValue.cityId &&
      addressValue.zipCode &&
      addressValue.street &&
      addressValue.number &&
      addressValue.neighborhood;

    const input: CourierCompanyInput = {
      name: value.name,
      legalName: value.legalName || null,
      document: value.document || null,
      stateRegistration: value.stateRegistration || null,
      email: value.email || null,
      observation: value.observation || null,
      printOnInvoice: value.printOnInvoice,
      isActive: value.isActive,
      address: hasAddress
        ? {
            zipCode: addressValue.zipCode,
            street: addressValue.street,
            number: addressValue.number,
            additionalDetails: addressValue.additionalDetails || null,
            referencePoint: addressValue.referencePoint || null,
            neighborhood: addressValue.neighborhood,
            cityId: addressValue.cityId,
          }
        : null,
    };

    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/courier-companies']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar transportadora');
    };

    this.isSaving.set(true);
    if (this.id()) {
      this.loadingTracker
        .track(this.globalLoader.track(this.api.update(this.id()!, input)))
        .subscribe({
          next: (updated) => {
            this.state.upsert(updated);
            this.state.updateListItem(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      this.loadingTracker.track(this.globalLoader.track(this.api.create(input))).subscribe({
        next: () => {
          this.state.clearListState();
          navigateToList();
        },
        error: failure,
      });
    }
  }

  cancel() {
    this.router.navigate(['/courier-companies']);
  }

  private applyCompany(company: CourierCompanyViewModel): void {
    this.form.patchValue({
      name: company?.name ?? '',
      legalName: company?.legalName ?? '',
      document: company?.document ?? '',
      stateRegistration: company?.stateRegistration ?? '',
      email: company?.email ?? '',
      observation: company?.observation ?? '',
      printOnInvoice: company?.printOnInvoice ?? false,
      isActive: company?.isActive ?? true,
    });

    const address = company?.address;
    if (address) {
      this.pendingStateAbbreviation = address.city?.state?.abbreviation ?? null;
      this.pendingCityId = address.city?.id ?? null;
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
      this.pendingStateAbbreviation = null;
      this.pendingCityId = null;
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
  }

  private resolveCompanyForReadOnly(): CourierCompanyViewModel | undefined {
    const fromNavigation = this.getCompanyFromNavigationState();
    if (fromNavigation) {
      this.state.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.state.getById(this.id());
  }

  private getCompanyFromNavigationState(): CourierCompanyViewModel | undefined {
    const navigation = this.router.getCurrentNavigation();
    const fromNavigation = navigation?.extras?.state?.['courierCompany'] as
      | CourierCompanyViewModel
      | undefined;
    if (fromNavigation) {
      return { ...fromNavigation };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const candidate = (history.state as Record<string, unknown>)['courierCompany'] as
        | CourierCompanyViewModel
        | undefined;
      if (candidate) {
        return { ...candidate };
      }
    }
    return undefined;
  }

  private applyPendingAddressSelection(): void {
    if (!this.pendingStateAbbreviation) {
      return;
    }
    if (!this.states || this.states.length === 0) {
      return;
    }
    const matching = this.states.find((s) => s.abbreviation === this.pendingStateAbbreviation);
    if (matching) {
      this.form.get('address.stateId')?.setValue(matching.id, { emitEvent: false });
      this.loadCities(matching, true);
    }
    this.pendingStateAbbreviation = null;
  }

  private loadStates() {
    this.loadingTracker
      .track(
        this.globalLoader.track(
          this.locationsApi.listStates({ pageSize: 100, orderBy: 'name', ascending: true }),
        ),
      )
      .subscribe({
        next: (res) => {
          this.states = res.items || [];
          this.applyPendingAddressSelection();
        },
        error: () => {
          const message =
            'Não foi possível carregar os estados. Atualize a página e tente novamente.';
          this.errorMessage.set(message);
          this.notifications.error(message);
        },
      });
  }

  private loadCities(state: StateSimpleViewModel, preserveSelection = false) {
    this.loadingTracker
      .track(
        this.globalLoader.track(
          this.locationsApi.listCities(state.abbreviation, {
            pageSize: 200,
            orderBy: 'name',
            ascending: true,
          }),
        ),
      )
      .subscribe({
        next: (res) => {
          this.cities = res.items || [];
          if (preserveSelection && this.pendingCityId) {
            const exists = this.cities.some((c) => c.id === this.pendingCityId);
            if (exists) {
              this.form.get('address.cityId')?.setValue(this.pendingCityId, { emitEvent: false });
            }
            this.pendingCityId = null;
          } else {
            this.form.get('address.cityId')?.setValue('', { emitEvent: false });
          }
        },
        error: () => {
          const message = 'Não foi possível carregar as cidades selecionadas. Tente novamente.';
          this.errorMessage.set(message);
          this.notifications.error(message);
        },
      });
  }
}
