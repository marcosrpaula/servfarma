import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PaginationService } from '../../../../shared/custom-pagination/pagination.service';
import { CourierCompanySimpleViewModel } from '../../../../shared/models/courier-companies';
import {
  CourierListFilterState,
  CourierSortableField,
  CourierViewModel,
  ListCouriersParams,
  defaultCourierListFilterState,
  normalizeCourierListFilters,
} from '../../../../shared/models/couriers';
import { CourierCompaniesApiService } from '../../courier-companies/services/courier-companies.api.service';
import {
  CourierSortLabel,
  CouriersListState,
  CouriersStateService,
} from '../services/couriers-state.service';
import { CouriersApiService } from '../services/couriers.api.service';

const SORT_FIELD_MAP: Record<CourierSortLabel, CourierSortableField> = {
  CreatedDate: 'createdAt',
  Name: 'name',
  Status: 'isActive',
};

@Component({
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CouriersComponent implements OnInit {
  private readonly api = inject(CouriersApiService);
  private readonly courierCompaniesApi = inject(CourierCompaniesApiService);
  private readonly pagination = inject(PaginationService);
  private readonly state = inject(CouriersStateService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadCrumbItems = [{ label: 'Administração' }, { label: 'Entregadores', active: true }];

  readonly filtersForm = this.fb.group({
    name: [defaultCourierListFilterState.name],
    courierCompanyId: [defaultCourierListFilterState.courierCompanyId],
    servedCityId: [defaultCourierListFilterState.servedCityId],
    isActive: [defaultCourierListFilterState.isActive],
  });

  readonly companies = signal<CourierCompanySimpleViewModel[]>([]);
  readonly tableData = signal<CourierViewModel[]>([]);
  readonly carregando = signal(false);
  readonly semResultados = computed(() => !this.carregando() && this.tableData().length === 0);

  pageSize = 10;
  backendPage = 1;
  totalItems = 0;

  orderBy: CourierSortableField = 'createdAt';
  ascending = false;
  orderLabel: CourierSortLabel = 'CreatedDate';

  private lastPagerKey = '';
  private lastRequestSignature = '';
  private allowPagerUpdates = false;

  ngOnInit(): void {
    this.pagination.tablePageSize
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ skip, pageSize }) => {
        if (!this.allowPagerUpdates) {
          return;
        }
        const size = typeof pageSize === 'number' && pageSize > 0 ? pageSize : this.pageSize || 10;
        const skipValue = typeof skip === 'number' && skip >= 0 ? skip : 0;
        const newPage = Math.floor(skipValue / size) + 1;
        const pagerKey = `${newPage}|${size}`;
        if (pagerKey === this.lastPagerKey) {
          return;
        }
        this.lastPagerKey = pagerKey;
        this.pageSize = size;
        this.backendPage = newPage;
        this.loadPage();
      });

    this.loadCompanies();

    const savedState = this.state.getListState();
    if (savedState) {
      this.restoreFromState(savedState);
      return;
    }

    this.allowPagerUpdates = true;
    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: [],
      serialNumberArray: [],
    });
    this.loadPage();
  }

  toggleSort(label: CourierSortLabel): void {
    if (this.orderLabel === label) {
      this.ascending = !this.ascending;
    } else {
      this.orderLabel = label;
      this.ascending = true;
    }
    this.orderBy = SORT_FIELD_MAP[label];
    this.backendPage = 1;
    this.loadPage();
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size) || 10;
    this.backendPage = 1;
    this.pagination.tablePageSize.next({
      skip: (this.backendPage - 1) * this.pageSize,
      limit: this.backendPage * this.pageSize,
      pageSize: this.pageSize,
    });
  }

  aplicarFiltros(): void {
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  limparFiltros(): void {
    this.filtersForm.setValue({
      name: defaultCourierListFilterState.name,
      courierCompanyId: defaultCourierListFilterState.courierCompanyId,
      servedCityId: defaultCourierListFilterState.servedCityId,
      isActive: defaultCourierListFilterState.isActive,
    });
    this.backendPage = 1;
    this.lastRequestSignature = '';
    this.loadPage();
  }

  companyNames(companies?: CourierCompanySimpleViewModel[]): string {
    if (!companies || companies.length === 0) {
      return '—';
    }
    return companies.map((company) => company.name).join(', ');
  }

  private loadCompanies(): void {
    this.courierCompaniesApi
      .list({ page: 1, pageSize: 100, orderBy: 'name', ascending: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.companies.set(res.items ?? []);
      });
  }

  private restoreFromState(state: CouriersListState): void {
    this.totalItems = state.totalItems;
    this.pageSize = state.pageSize;
    this.backendPage = state.backendPage;
    this.orderBy = state.sort.field;
    this.orderLabel = state.sort.label;
    this.ascending = state.sort.ascending;
    this.tableData.set(state.items);
    this.filtersForm.setValue(
      {
        name: state.filters.name,
        courierCompanyId: state.filters.courierCompanyId,
        servedCityId: state.filters.servedCityId,
        isActive: state.filters.isActive,
      },
      { emitEvent: false },
    );
    this.lastRequestSignature = state.lastRequestSignature ?? '';
    this.lastPagerKey = state.lastPagerKey ?? `${this.backendPage}|${this.pageSize}`;

    this.pagination.calculatePageSize.next({
      totalData: this.totalItems,
      pageSize: this.pageSize,
      tableData: state.items,
      serialNumberArray: [],
    });
    this.pagination.tablePageSize.next({
      skip: (this.backendPage - 1) * this.pageSize,
      limit: this.backendPage * this.pageSize,
      pageSize: this.pageSize,
    });
    this.allowPagerUpdates = true;
  }

  private loadPage(): void {
    this.carregando.set(true);
    this.lastPagerKey = `${this.backendPage}|${this.pageSize}`;

    const filters = this.getFilters();
    const params: ListCouriersParams = {
      page: this.backendPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      ascending: this.ascending,
      ...normalizeCourierListFilters(filters),
    };

    const signature = JSON.stringify(params);
    if (signature === this.lastRequestSignature) {
      this.carregando.set(false);
      return;
    }
    this.lastRequestSignature = signature;

    this.api
      .list(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregando.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.totalItems = res.totalCount ?? 0;
          const items = res.items ?? [];
          this.tableData.set(items);
          this.state.setMany(items);
          this.state.setListState({
            items,
            totalItems: this.totalItems,
            pageSize: this.pageSize,
            backendPage: this.backendPage,
            filters,
            sort: {
              field: this.orderBy,
              label: this.orderLabel,
              ascending: this.ascending,
            },
            lastRequestSignature: this.lastRequestSignature,
            lastPagerKey: this.lastPagerKey,
          });
          this.pagination.calculatePageSize.next({
            totalData: this.totalItems,
            pageSize: this.pageSize,
            tableData: items,
            serialNumberArray: [],
          });
        },
        error: () => {
          this.lastRequestSignature = '';
        },
      });
  }

  private getFilters(): CourierListFilterState {
    const { name, courierCompanyId, servedCityId, isActive } = this.filtersForm.getRawValue();
    return {
      name: name.trim(),
      courierCompanyId: courierCompanyId.trim(),
      servedCityId: servedCityId.trim(),
      isActive,
    };
  }
}
