import { Injectable } from '@angular/core';
import { ProjectViewModel } from '../../../../shared/models/projects';

function cloneProject(project: ProjectViewModel): ProjectViewModel {
  return {
    ...project,
    laboratory: project.laboratory ? { ...project.laboratory } : project.laboratory,
    stock: project.stock ? { ...project.stock } : project.stock,
    allowedServiceTypes: project.allowedServiceTypes?.map(type => ({ ...type })) ?? [],
  };
}

interface ProjectsListState {
  tableData: ProjectViewModel[];
  totalItems: number;
  pageSize: number;
  backendPage: number;
  filtroNome: string;
  filtroLaboratorio: string;
  filtroAtivo: '' | 'true' | 'false';
  orderBy: string;
  ascending: boolean;
  orderLabel: 'CreatedDate' | 'Name' | 'Status';
  lastRequestSignature?: string;
  lastPagerKey?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private readonly cache = new Map<string, ProjectViewModel>();
  private listState: ProjectsListState | null = null;

  upsert(project: ProjectViewModel): void {
    this.cache.set(project.id, cloneProject(project));
  }

  setMany(projects: ProjectViewModel[]): void {
    projects.forEach(project => this.upsert(project));
  }

  getById(id: string | null | undefined): ProjectViewModel | undefined {
    if (!id) {
      return undefined;
    }
    const found = this.cache.get(id);
    if (!found) {
      return undefined;
    }
    return cloneProject(found);
  }

  setListState(state: ProjectsListState): void {
    this.listState = {
      ...state,
      tableData: state.tableData.map(cloneProject),
    };
  }

  getListState(): ProjectsListState | null {
    if (!this.listState) {
      return null;
    }
    return {
      ...this.listState,
      tableData: this.listState.tableData.map(cloneProject),
    };
  }

  updateListItem(updated: ProjectViewModel): void {
    const cloned = cloneProject(updated);
    this.cache.set(cloned.id, cloned);
    if (!this.listState) {
      return;
    }
    if (!this.listState.tableData.some(project => project.id === cloned.id)) {
      return;
    }
    this.listState = {
      ...this.listState,
      tableData: this.listState.tableData.map(project =>
        project.id === cloned.id ? cloneProject(cloned) : cloneProject(project)
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
