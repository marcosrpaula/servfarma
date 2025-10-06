import { Injectable } from '@angular/core';
import { PharmaceuticalFormSortableField, PharmaceuticalFormViewModel } from '../../../../shared/models/pharmaceutical-forms';

interface PharmaceuticalFormsListState {
  tableData: PharmaceuticalFormViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroNome: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: PharmaceuticalFormSortableField;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'Name' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

@Injectable({ providedIn: 'root' })
export class PharmaceuticalFormsStateService {
  private readonly cache = new Map<string, PharmaceuticalFormViewModel>();
  private listState: PharmaceuticalFormsListState | null = null;

  upsert(form: PharmaceuticalFormViewModel): void {
    this.cache.set(form.id, { ...form });
  }

  setMany(forms: PharmaceuticalFormViewModel[]): void {
    forms.forEach(form => this.upsert(form));
  }

  getById(id: string | null | undefined): PharmaceuticalFormViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    return found ? { ...found } : undefined;
  }

  setListState(state: PharmaceuticalFormsListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(form => ({ ...form })),
    };
  }

  getListState(): PharmaceuticalFormsListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(form => ({ ...form })),
    };
  }

  updateListItem(updated: PharmaceuticalFormViewModel): void {
    this.upsert(updated);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(form => form.id === updated.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(form =>
        form.id === updated.id ? { ...updated } : { ...form }
      ),
    };
  }

  clearListState(): void {
    this.listState = null;
  }

  clear(): void {
    this.cache.clear();
    this.listState = null;
  }
}
