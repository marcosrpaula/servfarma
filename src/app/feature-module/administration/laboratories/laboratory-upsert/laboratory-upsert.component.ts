import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import {
  LaboratoryDetailsViewModel,
  LaboratoryViewModel,
} from '../../../../shared/models/laboratories';
import { SharedModule } from '../../../../shared/shared.module';
import { LaboratoriesStateService } from '../services/laboratories-state.service';
import {
  CreateLaboratoryDto,
  LaboratoriesApiService,
  UpdateLaboratoryDto,
} from '../services/laboratories.api.service';

@Component({
  selector: 'app-laboratory-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './laboratory-upsert.component.html',
  styleUrls: ['./laboratory-upsert.component.scss'],
})
export class LaboratoryUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(LaboratoriesApiService);
  private laboratoriesState = inject(LaboratoriesStateService);
  private notifications = inject(NotificationService);
  private globalLoader = inject(GlobalLoaderService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) {
      return 'Visualizar Laboratorio';
    }
    return this.id() ? 'Editar Laboratorio' : 'Adicionar Laboratorio';
  });

  breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Laboratorios', link: '/laboratories' },
    { label: this.title(), active: true },
  ]);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    tradeName: ['', [Validators.required, Validators.maxLength(100)]],
    legalName: ['', [Validators.required, Validators.maxLength(100)]],
    document: ['', [Validators.required]],
    observation: ['', [Validators.maxLength(1000)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);

    if (this.id()) {
      if (this.isReadOnly()) {
        const laboratory = this.resolveLaboratoryForReadOnly();
        if (!laboratory) {
          this.notifications.error(
            'Nao foi possivel carregar os dados do laboratorio para visualizacao. Acesse novamente a partir da listagem.',
          );
          this.router.navigate(['/laboratories']);
          return;
        }
        this.patchForm(laboratory);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.globalLoader
        .track(this.api.getById(this.id()!))
        .subscribe({
          next: (laboratory: LaboratoryDetailsViewModel) => {
            this.patchForm(laboratory);
            this.laboratoriesState.upsert(laboratory);
          },
          error: () => {
            const message =
              'Não foi possível carregar os dados do laboratório. Tente novamente a partir da listagem.';
            this.errorMessage.set(message);
            this.notifications.error(message);
            this.router.navigate(['/laboratories']);
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

    const value = this.form.value as any;
    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/laboratories']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar laboratorio');
    };

    this.isSaving.set(true);
    if (this.id()) {
      const dto: UpdateLaboratoryDto = {
        tradeName: value.tradeName,
        legalName: value.legalName,
        document: value.document,
        observation: value.observation,
        isActive: value.isActive,
      };
      this.globalLoader
        .track(this.api.update(this.id()!, dto))
        .subscribe({
          next: (updated) => {
            this.laboratoriesState.upsert(updated);
            this.laboratoriesState.updateListItem(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      const dto: CreateLaboratoryDto = {
        tradeName: value.tradeName,
        legalName: value.legalName,
        document: value.document,
        observation: value.observation,
        isActive: value.isActive,
      };
      this.globalLoader
        .track(this.api.create(dto))
        .subscribe({
          next: () => {
            this.laboratoriesState.clearListState();
            navigateToList();
          },
          error: failure,
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/laboratories']);
  }

  private patchForm(
    laboratory: Pick<
      LaboratoryViewModel,
      'tradeName' | 'legalName' | 'document' | 'observation' | 'isActive'
    >,
  ): void {
    this.form.patchValue({
      tradeName: laboratory?.tradeName ?? '',
      legalName: laboratory?.legalName ?? '',
      document: laboratory?.document ?? '',
      observation: laboratory?.observation ?? '',
      isActive: laboratory?.isActive ?? true,
    });
  }

  private resolveLaboratoryForReadOnly(): LaboratoryViewModel | undefined {
    const fromNavigation = this.getLaboratoryFromNavigationState();
    if (fromNavigation) {
      this.laboratoriesState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.laboratoriesState.getById(this.id());
  }

  private getLaboratoryFromNavigationState(): LaboratoryViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['laboratory'] as LaboratoryViewModel | undefined;
    if (candidate) {
      return { ...candidate };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['laboratory'] as
        | LaboratoryViewModel
        | undefined;
      if (historyCandidate) {
        return { ...historyCandidate };
      }
    }
    return undefined;
  }
}
