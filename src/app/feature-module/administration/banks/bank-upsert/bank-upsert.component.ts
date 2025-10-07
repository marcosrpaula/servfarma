import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NormalizedHttpError,
  NotificationService,
} from '../../../../core/notifications/notification.service';
import { applyServerValidationErrors } from '../../../../shared/common/server-validation.util';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import {
  BankDetailsViewModel,
  BankViewModel,
  CreateBankPayload,
  UpdateBankPayload,
} from '../../../../shared/models/banks';
import { LoadingOverlayComponent } from '../../../../shared/common/loading-overlay/loading-overlay.component';
import { SharedModule } from '../../../../shared/shared.module';
import { createLoadingTracker } from '../../../../shared/utils/loading-tracker';
import { BanksStateService } from '../services/banks-state.service';
import { BanksApiService } from '../services/banks.api.service';

@Component({
  selector: 'app-bank-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, LoadingOverlayComponent],
  templateUrl: './bank-upsert.component.html',
  styleUrls: ['./bank-upsert.component.scss'],
})
export class BankUpsertComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(BanksApiService);
  private readonly banksState = inject(BanksStateService);
  private readonly notifications = inject(NotificationService);
  private readonly globalLoader = inject(GlobalLoaderService);

  readonly id = signal<string | null>(null);
  readonly isReadOnly = signal(false);
  readonly title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Banco';
    return this.id() ? 'Editar Banco' : 'Adicionar Banco';
  });

  readonly breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Bancos', link: '/banks' },
    { label: this.title(), active: true },
  ]);

  readonly isSaving = signal(false);
  private readonly loadingTracker = createLoadingTracker();
  readonly isLoading = this.loadingTracker.isLoading;
  readonly isBusy = computed(() => this.isSaving() || this.loadingTracker.isLoading());
  readonly loadingMessage = computed(() =>
    this.isSaving() ? 'Salvando banco...' : this.loadingTracker.isLoading() ? 'Carregando banco...' : 'Processando...',
  );
  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    bankCode: ['', [Validators.required, Validators.maxLength(10)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.notifications.clearValidationErrors();
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);

    if (this.id()) {
      if (this.isReadOnly()) {
        const bank = this.resolveBankForReadOnly();
        if (!bank) {
          this.notifications.error(
            'Nao foi possivel carregar os dados do banco para visualizacao. Acesse novamente a partir da listagem.',
          );
          this.router.navigate(['/banks']);
          return;
        }
        this.patchForm(bank);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.globalLoader
        .track(this.api.getById(this.id()!))
        .subscribe({
          next: (bank: BankDetailsViewModel) => {
            this.patchForm(bank);
            this.banksState.upsert(bank);
          },
          error: () => {
            const message = 'Não foi possível carregar os dados do banco. Volte para a listagem.';
            this.notifications.error(message);
            this.router.navigate(['/banks']);
          },
        });
    } else if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
    }
  }

  save(): void {
    if (this.isReadOnly()) {
      return;
    }

    this.notifications.clearValidationErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as {
      name: string;
      bankCode: string;
      isActive: boolean;
    };
    const navigateToList = () => {
      this.isSaving.set(false);
      this.notifications.clearValidationErrors();
      this.router.navigate(['/banks']);
    };
    const failure = (error: unknown) => {
      this.isSaving.set(false);
      this.handleServerError(error);
    };

    this.isSaving.set(true);

    if (this.id()) {
      const dto: UpdateBankPayload = {
        name: value.name,
        bankCode: value.bankCode,
        isActive: value.isActive,
      };
      this.globalLoader
        .track(this.api.update(this.id()!, dto))
        .subscribe({
          next: (updated) => {
            this.banksState.upsert(updated);
            this.banksState.updateListItem(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      const dto: CreateBankPayload = {
        name: value.name,
        bankCode: value.bankCode,
        isActive: value.isActive,
      };
      this.globalLoader
        .track(this.api.create(dto))
        .subscribe({
          next: () => {
            this.banksState.clearListState();
            navigateToList();
          },
          error: failure,
        });
    }
  }

  cancel(): void {
    this.notifications.clearValidationErrors();
    this.router.navigate(['/banks']);
  }

  showInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  controlMessages(controlName: string): string[] {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return [];
    }

    const messages: string[] = [];
    const errors = control.errors;

    if (errors['required']) {
      messages.push('Este campo e obrigatorio.');
    }
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength ?? errors['minlength'].min;
      messages.push(`Informe pelo menos ${requiredLength} caracteres.`);
    }
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength ?? errors['maxlength'].max;
      messages.push(`Use no maximo ${maxLength} caracteres.`);
    }
    if (errors['server']) {
      const serverMessage = Array.isArray(errors['server'])
        ? errors['server'].join(' ')
        : errors['server'];
      messages.push(serverMessage);
    }

    return [...new Set(messages.filter(Boolean))];
  }
  formLevelMessages(): string[] {
    const errors = this.form.errors;
    if (!errors) {
      return [];
    }
    const messages: string[] = [];
    if (errors['server']) {
      messages.push(errors['server']);
    }
    return messages;
  }

  private patchForm(bank: Pick<BankViewModel, 'name' | 'bankCode' | 'isActive'>): void {
    this.form.patchValue({
      name: bank?.name ?? '',
      bankCode: bank?.bankCode ?? '',
      isActive: bank?.isActive ?? true,
    });
  }

  private resolveBankForReadOnly(): BankViewModel | undefined {
    const fromNavigation = this.getBankFromNavigationState();
    if (fromNavigation) {
      this.banksState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.banksState.getById(this.id());
  }

  private getBankFromNavigationState(): BankViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const fromNavigation = nav?.extras?.state?.['bank'] as BankViewModel | undefined;
    if (fromNavigation) {
      return { ...fromNavigation };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const candidate = (history.state as Record<string, unknown>)['bank'] as
        | BankViewModel
        | undefined;
      if (candidate) {
        return { ...candidate };
      }
    }
    return undefined;
  }
  private handleServerError(error: unknown): void {
    const normalized = error as NormalizedHttpError | undefined;
    const entries = normalized?.normalizedError?.validationErrors ?? [];
    applyServerValidationErrors(this.form, entries);
    this.form.markAllAsTouched();
  }
}
