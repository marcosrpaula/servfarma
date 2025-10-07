import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import {
  PharmaceuticalFormDetailsViewModel,
  PharmaceuticalFormViewModel,
} from '../../../../shared/models/pharmaceutical-forms';
import { SharedModule } from '../../../../shared/shared.module';
import { PharmaceuticalFormsStateService } from '../services/pharmaceutical-forms-state.service';
import {
  CreatePharmaceuticalFormDto,
  PharmaceuticalFormsApiService,
  UpdatePharmaceuticalFormDto,
} from '../services/pharmaceutical-forms.api.service';

@Component({
  selector: 'app-pharmaceutical-form-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './pharmaceutical-form-upsert.component.html',
  styleUrls: ['./pharmaceutical-form-upsert.component.scss'],
})
export class PharmaceuticalFormUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(PharmaceuticalFormsApiService);
  private formsState = inject(PharmaceuticalFormsStateService);
  private notifications = inject(NotificationService);
  private globalLoader = inject(GlobalLoaderService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Forma Farmaceutica';
    return this.id() ? 'Editar Forma Farmaceutica' : 'Adicionar Forma Farmaceutica';
  });

  breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Formas Farmaceuticas', link: '/pharmaceutical-forms' },
    { label: this.title(), active: true },
  ]);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);

    if (this.id()) {
      if (this.isReadOnly()) {
        const form = this.resolveFormForReadOnly();
        if (!form) {
          this.notifications.error(
            'Nao foi possivel carregar os dados da forma farmaceutica para visualizacao. Acesse novamente a partir da listagem.',
          );
          this.router.navigate(['/pharmaceutical-forms']);
          return;
        }
        this.patchForm(form);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.globalLoader
        .track(this.api.getById(this.id()!))
        .subscribe({
          next: (form: PharmaceuticalFormDetailsViewModel) => {
            this.patchForm(form);
            this.formsState.upsert(form);
          },
          error: () => {
            const message =
              'Não foi possível carregar os dados da forma farmacêutica. Acesse novamente a partir da listagem.';
            this.errorMessage.set(message);
            this.notifications.error(message);
            this.router.navigate(['/pharmaceutical-forms']);
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
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as { name: string; isActive: boolean };
    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/pharmaceutical-forms']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar forma farmaceutica');
    };

    this.isSaving.set(true);
    if (this.id()) {
      const dto: UpdatePharmaceuticalFormDto = {
        name: value.name,
        isActive: value.isActive,
      };
      this.globalLoader
        .track(this.api.update(this.id()!, dto))
        .subscribe({
          next: (updated) => {
            this.formsState.upsert(updated);
            this.formsState.updateListItem(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      const dto: CreatePharmaceuticalFormDto = {
        name: value.name,
        isActive: value.isActive,
      };
      this.globalLoader
        .track(this.api.create(dto))
        .subscribe({
          next: () => {
            this.formsState.clearListState();
            navigateToList();
          },
          error: failure,
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/pharmaceutical-forms']);
  }

  private patchForm(form: Pick<PharmaceuticalFormViewModel, 'name' | 'isActive'>): void {
    this.form.patchValue({
      name: form?.name ?? '',
      isActive: form?.isActive ?? true,
    });
  }

  private resolveFormForReadOnly(): PharmaceuticalFormViewModel | undefined {
    const fromNavigation = this.getFormFromNavigationState();
    if (fromNavigation) {
      this.formsState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.formsState.getById(this.id());
  }

  private getFormFromNavigationState(): PharmaceuticalFormViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['pharmaceuticalForm'] as
      | PharmaceuticalFormViewModel
      | undefined;
    if (candidate) {
      return { ...candidate };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['pharmaceuticalForm'] as
        | PharmaceuticalFormViewModel
        | undefined;
      if (historyCandidate) {
        return { ...historyCandidate };
      }
    }
    return undefined;
  }
}
