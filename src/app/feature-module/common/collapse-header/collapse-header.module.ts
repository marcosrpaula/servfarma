import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseHeaderComponent } from './collapse-header.component';

@NgModule({
  declarations: [CollapseHeaderComponent],
  imports: [CommonModule, MatTooltipModule, TooltipModule],
  exports: [CollapseHeaderComponent],
})
export class CollapseHeaderModule {}
