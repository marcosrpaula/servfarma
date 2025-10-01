import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtraPagesRoutingModule } from './extrapages-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { StarterComponent } from './starter/starter.component';

@NgModule({
  declarations: [
    StarterComponent
  ],
  imports: [
    CommonModule,
    ExtraPagesRoutingModule,
    SharedModule
  ]
})
export class ExtraspagesModule { }
