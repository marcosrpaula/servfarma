/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { breadCrumbItems } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
}
@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
  standalone: false,
})
export class EmployeeDashboardComponent implements AfterViewInit, OnInit {
  breadCrumbItems: breadCrumbItems[] = [];
  public leaves_chart: Partial<ChartOptions> | any;
  public performance_chart2: Partial<ChartOptions> | any;
  @ViewChild('chart') chart!: ChartComponent;
  @ViewChildren('circleProgress') circleProgressElements!: QueryList<ElementRef>;
  today!: Date;
  routes = routes;
  ngAfterViewInit() {
    this.updateProgress();
  }
  updateProgress() {
    this.circleProgressElements.forEach((elementRef) => {
      const element = elementRef.nativeElement;
      const value = parseInt(element.getAttribute('data-value'), 10);
      const left = element.querySelector('.progress-left .progress-bar');
      const right = element.querySelector('.progress-right .progress-bar');

      if (value > 0) {
        if (value <= 50) {
          right.style.transform = 'rotate(' + this.percentageToDegrees(value) + 'deg)';
        } else {
          right.style.transform = 'rotate(180deg)';
          left.style.transform = 'rotate(' + this.percentageToDegrees(value - 50) + 'deg)';
        }
      }
    });
  }

  ngOnInit(): void {
    this.today = new Date();
    /**
     *
     * BreadCrumb
     */
    this.breadCrumbItems = [{ label: 'Dashboards' }, { label: 'Employee Dashboard', active: true }];
    this.leaves_chart = {
      chart: {
        height: 255,
        type: 'donut',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: {
        enabled: false,
      },

      series: [15, 10, 5, 10, 60],
      colors: ['#F26522', '#FFC107', '#E70D0D', '#03C95A', '#0C4B5E'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              show: false,
            },
          },
        },
      ],
      legend: {
        show: false,
      },
    };
    this.performance_chart2 = {
      series: [
        {
          name: 'performance',
          data: [20, 20, 35, 35, 40, 60, 60],
        },
      ],
      chart: {
        height: 273,
        type: 'area',
        zoom: {
          enabled: false,
        },
      },
      colors: ['#03C95A'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      title: {
        text: '',
        align: 'left',
      },
      // grid: {
      //   row: {
      //     colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      //     opacity: 0.5
      //   },
      // },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      },
      yaxis: {
        min: 10,
        max: 60,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => {
            return val / 1 + 'K';
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    };
  }
  percentageToDegrees(percentage: number): number {
    return (percentage / 100) * 360;
  }
}
