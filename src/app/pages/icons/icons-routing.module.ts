import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { BoxiconsComponent } from './boxicons/boxicons.component';
import { FeatherComponent } from './feather/feather.component';
import { IconsCryptoComponent } from './icons-crypto/icons-crypto.component';
import { LineawesomeComponent } from './lineawesome/lineawesome.component';
import { MaterialdesignComponent } from './materialdesign/materialdesign.component';
import { RemixComponent } from './remix/remix.component';

const routes: Routes = [
  {
    path: 'remix',
    component: RemixComponent,
  },
  {
    path: 'boxicons',
    component: BoxiconsComponent,
  },
  {
    path: 'materialdesign',
    component: MaterialdesignComponent,
  },
  {
    path: 'feather',
    component: FeatherComponent,
  },
  {
    path: 'lineawesome',
    component: LineawesomeComponent,
  },
  {
    path: 'icons-crypto',
    component: IconsCryptoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IconsRoutingModule {}
