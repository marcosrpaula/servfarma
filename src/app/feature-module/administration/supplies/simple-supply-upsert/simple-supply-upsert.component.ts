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
  SimpleItemInput,
  SimpleItemType,
  SimpleItemViewModel,
  SupplyType,
} from '../../../../shared/models/supplies';
import { SuppliesStateService } from '../services/supplies-state.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { SharedModule } from '../../../../shared/shared.module';

const SIMPLE_TYPE_OPTIONS: { value: SimpleItemType; label: string }[] = [
  { value: 'Label', label: 'Etiqueta' },
  { value: 'Receipt', label: 'Recibo' },
  { value: 'SecurityEnvelope', label: 'Envelope de Seguranca' },
];

@Component({
  selector: 'app-simple-supply-upsert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './simple-supply-upsert.component.html',
  styleUrls: ['./simple-supply-upsert.component.scss'],
})
export class SimpleSupplyUpsertComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(SuppliesApiService);
  private suppliesState = inject(SuppliesStateService);
  private notifications = inject(NotificationService);

  id = signal<string | null>(null);
  isReadOnly = signal(false);
  title = computed(() => {
    if (this.isReadOnly()) return 'Visualizar Item Simples';
    return this.id() ? 'Editar Item Simples' : 'Adicionar Item Simples';
  });

  breadCrumbItems = computed(() => [
    { label: 'Catalogos' },
    { label: 'Suprimentos', link: '/supplies' },
    { label: this.title(), active: true },
  ]);

  typeOptions = SIMPLE_TYPE_OPTIONS;

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: [0, [Validators.required, Validators.min(0)]],
    type: ['Label' as SimpleItemType, [Validators.required]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id'));
    this.isReadOnly.set(this.route.snapshot.data?.['readOnly'] === true);

    if (this.id()) {
      if (this.isReadOnly()) {
        const supply = this.resolveSupplyForReadOnly();
        if (!supply) {
          this.notifications.error('Nao foi possivel carregar os dados do suprimento para visualizacao. Acesse novamente a partir da listagem.');
          this.router.navigate(['/supplies']);
          return;
        }
        this.patchForm(supply);
        this.form.disable({ emitEvent: false });
        return;
      }

      this.api.getSimpleItem(this.id()!).subscribe((item) => {
        this.patchForm(item);
        this.suppliesState.upsert(item);
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

    const value = this.form.value as SimpleItemInput;

    const navigateToList = () => {
      this.isSaving.set(false);
      this.router.navigate(['/supplies']);
    };
    const failure = (error: any) => {
      this.isSaving.set(false);
      this.errorMessage.set(error?.error?.message ?? 'Erro ao salvar suprimento');
    };

    this.isSaving.set(true);
    if (this.id()) {
      this.api.updateSimpleItem(this.id()!, value).subscribe({
        next: (updated) => {
          this.suppliesState.upsert(updated);
          this.suppliesState.updateListItem(updated);
          navigateToList();
        },
        error: failure,
      });
    } else {
      this.api.createSimpleItem(value).subscribe({
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

  private patchForm(item: SimpleItemViewModel) {
    this.form.patchValue({
      name: item.name,
      price: item.price,
      type: this.mapSupplyTypeToSimpleType(item.type),
      isActive: item.isActive,
    });
  }

  private mapSupplyTypeToSimpleType(type: number): SimpleItemType {
    switch (type) {
      case SupplyType.SecurityEnvelope:
        return 'SecurityEnvelope';
      case SupplyType.Receipt:
        return 'Receipt';
      case SupplyType.Label:
      default:
        return 'Label';
    }
  }

  private resolveSupplyForReadOnly(): SimpleItemViewModel | undefined {
    const fromNavigation = this.getSupplyFromNavigationState();
    if (fromNavigation) {
      this.suppliesState.upsert(fromNavigation);
      return fromNavigation;
    }
    return this.suppliesState.getById(this.id());
  }

  private getSupplyFromNavigationState(): SimpleItemViewModel | undefined {
    const nav = this.router.getCurrentNavigation();
    const candidate = nav?.extras?.state?.['supply'] as SimpleItemViewModel | undefined;
    if (candidate) {
      return { ...candidate };
    }
    if (typeof history !== 'undefined' && history.state && typeof history.state === 'object') {
      const historyCandidate = (history.state as Record<string, unknown>)['supply'] as SimpleItemViewModel | undefined;
      if (historyCandidate) {
        return { ...historyCandidate };
      }
    }
    return undefined;
  }
}





