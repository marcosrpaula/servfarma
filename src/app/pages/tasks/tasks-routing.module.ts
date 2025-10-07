import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { DetailsComponent } from './details/details.component';
import { KanbanComponent } from './kanban/kanban.component';
import { ListViewComponent } from './list-view/list-view.component';

const routes: Routes = [
  {
    path: 'kanban',
    component: KanbanComponent,
  },
  {
    path: 'list-view',
    component: ListViewComponent,
  },
  {
    path: 'details',
    component: DetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasksRoutingModule {}
