import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Component pages
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { ExtrapagesRoutingModule } from './extraspages-routing.module';
import { MaintenanceComponent } from './maintenance/maintenance.component';

@NgModule({
  declarations: [MaintenanceComponent, ComingSoonComponent],
  imports: [CommonModule, ExtrapagesRoutingModule],
})
export class ExtraspagesModule {}
