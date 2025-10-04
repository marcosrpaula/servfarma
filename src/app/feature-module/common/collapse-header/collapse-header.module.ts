import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CollapseHeaderComponent } from './collapse-header.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';



@NgModule({
  declarations: [
    CollapseHeaderComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    TooltipModule
  ],
  exports: [CollapseHeaderComponent],
})
export class CollapseHeaderModule { }
