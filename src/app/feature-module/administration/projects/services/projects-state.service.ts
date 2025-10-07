import { Injectable } from '@angular/core';
import { ProjectSortableField, ProjectViewModel } from '../../../../shared/models/projects';
import {
  EntityListState,
  EntityListStateService,
  ListSortState,
} from '../../../../shared/state/entity-list-state.service';

export type ProjectSortLabel = 'CreatedDate' | 'Name' | 'Status';

export interface ProjectListFiltersState {
  name: string;
  laboratoryId: string;
  isActive: '' | 'true' | 'false';
}

export interface ProjectsListState
  extends EntityListState<ProjectViewModel, ProjectListFiltersState, ProjectSortableField> {
  sort: ListSortState<ProjectSortableField> & { label: ProjectSortLabel };
}

@Injectable({ providedIn: 'root' })
export class ProjectsStateService extends EntityListStateService<
  ProjectViewModel,
  ProjectListFiltersState,
  ProjectSortableField
> {
  override setListState(state: ProjectsListState): void {
    super.setListState(state);
  }

  override getListState(): ProjectsListState | null {
    return super.getListState() as ProjectsListState | null;
  }

  override cloneFilters(filters: ProjectListFiltersState): ProjectListFiltersState {
    return { ...filters };
  }
}
