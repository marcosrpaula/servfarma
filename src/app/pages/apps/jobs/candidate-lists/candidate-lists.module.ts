import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

// Routing
import { SharedModule } from 'src/app/shared/shared.module';
import { CandidateListsRoutingModule } from './candidate-lists-routing.module';

import { GridViewComponent } from './grid-view/grid-view.component';
import { ListViewComponent } from './list-view/list-view.component';

@NgModule({
  declarations: [ListViewComponent, GridViewComponent],
  imports: [
    CommonModule,
    CandidateListsRoutingModule,
    SharedModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CandidateListsModule {}
