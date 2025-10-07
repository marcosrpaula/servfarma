import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

// Apex Chart
import { NgApexchartsModule } from 'ng-apexcharts';

import { BaseChartDirective } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';

// Component Pages
import { SharedModule } from '../../shared/shared.module';
import { AreaComponent } from './Apexcharts/area/area.component';
import { BarComponent } from './Apexcharts/bar/bar.component';
import { BoxplotComponent } from './Apexcharts/boxplot/boxplot.component';
import { BubbleComponent } from './Apexcharts/bubble/bubble.component';
import { CandlestickComponent } from './Apexcharts/candlestick/candlestick.component';
import { ColumnComponent } from './Apexcharts/column/column.component';
import { FunnelComponent } from './Apexcharts/funnel/funnel.component';
import { HeatmapComponent } from './Apexcharts/heatmap/heatmap.component';
import { LineComponent } from './Apexcharts/line/line.component';
import { MixedComponent } from './Apexcharts/mixed/mixed.component';
import { PieComponent } from './Apexcharts/pie/pie.component';
import { PolarComponent } from './Apexcharts/polar/polar.component';
import { RadarComponent } from './Apexcharts/radar/radar.component';
import { RadialbarComponent } from './Apexcharts/radialbar/radialbar.component';
import { RangeAreaComponent } from './Apexcharts/range-area/range-area.component';
import { ScatterComponent } from './Apexcharts/scatter/scatter.component';
import { SlopeareaComponent } from './Apexcharts/slope/slopearea.component';
import { TimelineComponent } from './Apexcharts/timeline/timeline.component';
import { TreemapComponent } from './Apexcharts/treemap/treemap.component';
import { ChartjsComponent } from './chartjs/chartjs.component';
import { ChartsRoutingModule } from './charts-routing.module';
import { EchartComponent } from './echart/echart.component';

@NgModule({
  declarations: [
    LineComponent,
    AreaComponent,
    ColumnComponent,
    BarComponent,
    MixedComponent,
    TimelineComponent,
    CandlestickComponent,
    BoxplotComponent,
    BubbleComponent,
    ScatterComponent,
    HeatmapComponent,
    TreemapComponent,
    PieComponent,
    RadialbarComponent,
    RadarComponent,
    PolarComponent,
    ChartjsComponent,
    EchartComponent,
    RangeAreaComponent,
    FunnelComponent,
    SlopeareaComponent,
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    BaseChartDirective,
    ChartsRoutingModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChartsModule {}
