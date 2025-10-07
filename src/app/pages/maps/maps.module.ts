import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

// Google Map
import { GoogleMapsModule } from '@angular/google-maps';

// Leaflet Map
import { LeafletModule } from '@bluehalo/ngx-leaflet';

// Component pages
import { SharedModule } from '../../shared/shared.module';
import { GoogleComponent } from './google/google.component';
import { LeafletComponent } from './leaflet/leaflet.component';
import { MapsRoutingModule } from './maps-routing.module';

@NgModule({
  declarations: [GoogleComponent, LeafletComponent],
  imports: [CommonModule, GoogleMapsModule, LeafletModule, MapsRoutingModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapsModule {}
