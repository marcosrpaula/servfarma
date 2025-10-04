import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects/projects.component';
import { ServfarmaSharedModule } from '../../../shared/servfarma-shared.module';
import { CustomPaginationModule } from '../../../shared/custom-pagination/custom-pagination.module';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [CommonModule, FormsModule, ServfarmaSharedModule, CustomPaginationModule, ProjectsRoutingModule],
})
export class ProjectsModule {}
