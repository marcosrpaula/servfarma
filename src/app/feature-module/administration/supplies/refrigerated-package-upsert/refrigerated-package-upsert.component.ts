import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SuppliesApiService } from '../services/supplies.api.service';
import {
  PackageViewModel,
  RefrigeratedPackageInput,
  SimpleItemViewModel,
} from '../../../../shared/models/supplies';
import { SuppliesStateService } from '../services/supplies-state.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-refrigerated-package-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './refrigerated-package-upsert.component.html',
  styleUrls: ['./refrigerated-package-upsert.component.scss'],
})
export class RefrigeratedPackageUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(SuppliesApiService);
  private suppliesState = inject(SuppliesStateService);
  private notifications = inject(NotificationService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Pacote Refrigerado';
    return this.id() ? 'Editar Pacote Refrigerado' : 'Adicionar Pacote Refrigerado';
  });

  breadCrumbItems = computed(() => [
    { label: 'Catalogos' },
    { label: 'Suprimentos', link: '/supplies' },
    { label: this.title(), active: true },
  ]);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: [0, [Validators.required, Validators.min(0)]],
    height: [0, [Validators.required, Validators.min(0)]],
    width: [0, [Validators.required, Validators.min(0)]],
    depth: [0, [Validators.required, Validators.min(0)]],
    barcode: ['', [Validators.required, Validators.maxLength(80)]],
    coolingDurationHours: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);

    if (this.id()) {
      if (this.isReadOnly()) {
        const pkg = this.resolvePackageForReadOnly();
        if (!pkg) {
          this.notifications.error('Nao foi possivel carregar os dados do pacote para visualizacao. Acesse novamente a partir da listagem.');
          this.router.navigate(['/supplies']);
          return;
        }
        this.patchForm(pkg);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.api.getRefrigeratedPackage(this.id()!).subscribe((pkg) => {
        this.patchForm(pkg);
        this.suppliesState.upsert(pkg);
      });
    } else if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
    }
  }

  save() {
    if (this.isReadOnly()) return;
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as RefrigeratedPackageInput;

    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/supplies']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar pacote');
    };

    this.isSaving.set(true);
    if (this.id()) {
      this.api
        .updateRefrigeratedPackage(this.id()!, value)
        .subscribe({
          next: (updated) => {
            this.suppliesState.upsert(updated);
            this.suppliesState.updateListItem(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      this.api.createRefrigeratedPackage(value).subscribe({
        next: () => {
          this.suppliesState.clearListState();
          navigateToList();
        },
        error: failure,
      });
    }
  }

  cancel() {
    this.router.navigate(['/supplies']);
  }

  private patchForm(pkg: PackageViewModel) {
    this.form.patchValue({
      name: pkg.name,
      price: pkg.price,
      height: pkg.height ?? 0,
      width: pkg.width ?? 0,
      depth: pkg.depth ?? 0,
      barcode: pkg.barcode ?? '',
      coolingDurationHours: pkg.coolingDurationHours ?? 0,
      isActive: pkg.isActive,
    });
  }

  private resolvePackageForReadOnly(): PackageViewModel | undefined {
    const fromNavigation = this.getPackageFromNavigationState();
    if (fromNavigation) {
      this.suppliesState.upsert(fromNavigation);
      return fromNavigation;
    }
    const cached = this.suppliesState.getById(this.id());
    return cached ? this.toPackageViewModel(cached) : undefined;
  }

  private getPackageFromNavigationState(): PackageViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['supply'] as (PackageViewModel | SimpleItemViewModel | undefined);
    if (candidate) {
      return this.toPackageViewModel(candidate);
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['supply'] as (PackageViewModel | SimpleItemViewModel | undefined);
      if (historyCandidate) {
        return this.toPackageViewModel(historyCandidate);
      }
    }
    return undefined;
  }

  private toPackageViewModel(data: PackageViewModel | SimpleItemViewModel): PackageViewModel {
    const pkg = data as PackageViewModel;
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      height: pkg.height ?? 0,
      width: pkg.width ?? 0,
      depth: pkg.depth ?? 0,
      barcode: pkg.barcode ?? '',
      coolingDurationHours: pkg.coolingDurationHours ?? 0,
      isActive: data.isActive,
      type: data.type,
      createdAt: data.createdAt,
      createdBy: data.createdBy,
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy,
    };
  }
}

