import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { GlobalLoaderService } from '../../../../shared/common/global-loader.service';
import { LoadingOverlayComponent } from '../../../../shared/common/loading-overlay/loading-overlay.component';
import { LaboratoryViewModel } from '../../../../shared/models/laboratories';
import { ProjectInput, ProjectViewModel } from '../../../../shared/models/projects';
import { SharedModule } from '../../../../shared/shared.module';
import { createLoadingTracker } from '../../../../shared/utils/loading-tracker';
import { LaboratoriesApiService } from '../../laboratories/services/laboratories.api.service';
import { ProjectsStateService } from '../services/projects-state.service';
import { ProjectsApiService } from '../services/projects.api.service';

interface ServiceTypeOption {
  id: number;
  label: string;
}

const SERVICE_TYPE_OPTIONS: ServiceTypeOption[] = [
  { id: 1, label: 'Ressarcimento' },
  { id: 2, label: 'Troca' },
  { id: 3, label: 'Coleta' },
  { id: 4, label: 'Entrega' },
  { id: 5, label: 'Devolucao' },
];

@Component({
  selector: 'app-project-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, LoadingOverlayComponent],
  templateUrl: './project-upsert.component.html',
  styleUrls: ['./project-upsert.component.scss'],
})
export class ProjectUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(ProjectsApiService);
  private labsApi = inject(LaboratoriesApiService);
  private projectsState = inject(ProjectsStateService);
  private notifications = inject(NotificationService);
  private globalLoader = inject(GlobalLoaderService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Projeto';
    return this.id() ? 'Editar Projeto' : 'Adicionar Projeto';
  });

  breadCrumbItems = computed(() => [
    { label: 'Administracao' },
    { label: 'Projetos', link: '/projects' },
    { label: this.title(), active: true },
  ]);

  serviceTypeOptions = SERVICE_TYPE_OPTIONS;

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadingTracker = createLoadingTracker();
  readonly isLoading = this.loadingTracker.isLoading;
  readonly isBusy = computed(() => this.isSaving() || this.loadingTracker.isLoading());
  readonly loadingMessage = computed(() => {
    if (this.isSaving()) {
      return this.id() ? 'Atualizando projeto...' : 'Salvando projeto...';
    }
    if (this.loadingTracker.isLoading()) {
      return this.id() ? 'Carregando dados do projeto...' : 'Carregando dados necessários...';
    }
    return 'Processando...';
  });
  labs: LaboratoryViewModel[] = [];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    laboratoryId: ['', [Validators.required]],
    observation: ['', [Validators.maxLength(500)]],
    emitReturnInvoice: [true],
    emitInvoice: [true],
    isActive: [true],
    allowedServiceTypes: [[], [Validators.required]],
    stock: this.fb.group({
      mainStock: ['', [Validators.maxLength(30)]],
      kitStock: ['', [Validators.maxLength(30)]],
      sampleStock: ['', [Validators.maxLength(30)]],
      blockedStock: ['', [Validators.maxLength(30)]],
      blockSimilarLot: [false],
      blockBeforeExpirationInMonths: [0, [Validators.min(0)]],
    }),
  });

  ngOnInit(): void {
    this.notifications.clearValidationErrors();
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);
    this.loadLaboratories();

    if (this.id()) {
      if (this.isReadOnly()) {
        const project = this.resolveProjectForReadOnly();
        if (!project) {
          this.notifications.error(
            'Nao foi possivel carregar os dados do projeto para visualizacao. Acesse novamente a partir da listagem.',
          );
          this.router.navigate(['/projects']);
          return;
        }
        this.patchForm(project);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.loadingTracker.track(this.globalLoader.track(this.api.getById(this.id()!))).subscribe({
        next: (project) => {
          this.patchForm(project);
          this.projectsState.upsert(project);
        },
        error: () => {
          const message =
            'Não foi possível carregar os dados do projeto. Acesse novamente a partir da listagem.';
          this.errorMessage.set(message);
          this.notifications.error(message);
          this.router.navigate(['/projects']);
        },
      });
      return;
    }

    if (this.isReadOnly()) {
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

    const value = this.form.value as any;
    const laboratoryIdControl = this.form.get('laboratoryId');
    const laboratoryId: string = value.laboratoryId ? String(value.laboratoryId) : '';

    if (!laboratoryId) {
      laboratoryIdControl?.setErrors({ required: true });
      laboratoryIdControl?.markAsTouched({ onlySelf: true });
      return;
    }

    const stockValue = value.stock || {};
    const hasStock =
      stockValue.mainStock ||
      stockValue.kitStock ||
      stockValue.sampleStock ||
      stockValue.blockedStock;

    const input: ProjectInput = {
      name: value.name,
      laboratoryId,
      observation: value.observation || null,
      emitReturnInvoice: value.emitReturnInvoice,
      emitInvoice: value.emitInvoice,
      allowedServiceTypes: value.allowedServiceTypes || [],
      isActive: value.isActive,
      stock: hasStock
        ? {
            mainStock: stockValue.mainStock || '',
            kitStock: stockValue.kitStock || '',
            sampleStock: stockValue.sampleStock || '',
            blockedStock: stockValue.blockedStock || '',
            blockSimilarLot: !!stockValue.blockSimilarLot,
            blockBeforeExpirationInMonths: Number(stockValue.blockBeforeExpirationInMonths || 0),
          }
        : null,
    };

    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/projects']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar projeto');
    };

    this.isSaving.set(true);
    if (this.id()) {
      this.loadingTracker
        .track(this.globalLoader.track(this.api.update(this.id()!, input)))
        .subscribe({
          next: (updated) => {
            this.projectsState.upsert(updated);
            this.projectsState.updateListItem(updated);
            navigateToList();
          },
          error: failure,
        });
    } else {
      this.loadingTracker.track(this.globalLoader.track(this.api.create(input))).subscribe({
        next: () => {
          this.projectsState.clearListState();
          navigateToList();
        },
        error: failure,
      });
    }
  }

  cancel() {
    this.router.navigate(['/projects']);
  }

  private patchForm(project: ProjectViewModel) {
    this.form.patchValue({
      name: project.name,
      laboratoryId: project.laboratory?.id ?? '',
      observation: project.observation ?? '',
      emitReturnInvoice: project.emitReturnInvoice,
      emitInvoice: project.emitInvoice,
      isActive: project.isActive,
      allowedServiceTypes: project.allowedServiceTypes?.map((s) => s.id) ?? [],
    });

    if (project.stock) {
      this.form.get('stock')?.patchValue({
        mainStock: project.stock.mainStock,
        kitStock: project.stock.kitStock,
        sampleStock: project.stock.sampleStock,
        blockedStock: project.stock.blockedStock,
        blockSimilarLot: project.stock.blockSimilarLot,
        blockBeforeExpirationInMonths: project.stock.blockBeforeExpirationInMonths,
      });
    }
  }

  private loadLaboratories() {
    this.loadingTracker
      .track(
        this.globalLoader.track(
          this.labsApi.list({ page: 1, pageSize: 100, orderBy: 'trade_name', ascending: true }),
        ),
      )
      .subscribe({
        next: (res) => {
          this.labs = res.items || [];
          if (!this.id() && !this.isReadOnly() && this.labs.length === 1) {
            const control = this.form.get('laboratoryId');
            if (!control?.value) {
              control?.setValue(this.labs[0].id, { emitEvent: false });
            }
          }
        },
        error: () => {
          const message =
            'Não foi possível carregar os laboratórios. Atualize a página e tente novamente.';
          this.errorMessage.set(message);
          this.notifications.error(message);
        },
      });
  }

  private resolveProjectForReadOnly(): ProjectViewModel | undefined {
    const fromNavigation = this.getProjectFromNavigationState();
    if (fromNavigation) {
      this.projectsState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.projectsState.getById(this.id());
  }

  private getProjectFromNavigationState(): ProjectViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['project'] as ProjectViewModel | undefined;
    if (candidate) {
      return {
        ...candidate,
        laboratory: candidate.laboratory ? { ...candidate.laboratory } : candidate.laboratory,
        stock: candidate.stock ? { ...candidate.stock } : candidate.stock,
        allowedServiceTypes: candidate.allowedServiceTypes?.map((s) => ({ ...s })) ?? [],
      };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['project'] as
        | ProjectViewModel
        | undefined;
      if (historyCandidate) {
        return {
          ...historyCandidate,
          laboratory: historyCandidate.laboratory
            ? { ...historyCandidate.laboratory }
            : historyCandidate.laboratory,
          stock: historyCandidate.stock ? { ...historyCandidate.stock } : historyCandidate.stock,
          allowedServiceTypes: historyCandidate.allowedServiceTypes?.map((s) => ({ ...s })) ?? [],
        };
      }
    }
    return undefined;
  }
}
