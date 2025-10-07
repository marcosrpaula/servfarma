/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-leads-dashboard',
  templateUrl: './leads-dashboard.component.html',
  styleUrl: './leads-dashboard.component.scss',
  standalone: false,
})
export class LeadsDashboardComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public revenue_income: Partial<ChartOptions> | any;
  public heat_chart: Partial<ChartOptions> | any;
  public leads_stage: Partial<ChartOptions> | any;
  public donut_chart_2: Partial<ChartOptions> | any;
  public donut_chart_3: Partial<ChartOptions> | any;
  breadCrumbItems: breadCrumbItems[] = [];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  routes = routes;
  constructor() {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }
  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Dashboards' }, { label: 'Leads Dashboard', active: true }];
    this.revenue_income = {
      chart: {
        height: 230,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: ['#FF6F28', '#F8F9FA'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          borderRadius: 5,
          borderRadiusWhenStacked: 'all',
          horizontal: false,
          endingShape: 'rounded',
        },
      },
      series: [
        {
          name: 'Income',
          data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80],
        },
        {
          name: 'Expenses',
          data: [60, 70, 55, 20, 15, 10, 20, 20, 20, 15, 80, 20],
        },
      ],
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '13px',
          },
        },
      },
      yaxis: {
        min: 0, // Set the minimum value of the Y-axis to 0
        max: 100,
        labels: {
          offsetX: -15,
          style: {
            colors: '#6B7280',
            fontSize: '13px',
          },
          formatter: function (value: any) {
            return value + 'K'; // Divide by 1000 and append 'K'
          },
        },
      },
      grid: {
        borderColor: 'transparent',
        strokeDashArray: 5,
        padding: {
          left: -8,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val / 10 + ' k';
          },
        },
      },
      fill: {
        opacity: 1,
      },
    };
    this.heat_chart = {
      chart: {
        type: 'heatmap',
        height: 300,
      },
      colors: ['#9CA3AF', '#F37438', '#9CA3AF', '#F37438', '#9CA3AF', '#F37438'],
      series: [
        {
          name: '0',
          data: [
            {
              x: 'Mon',
              y: 22,
            },
            {
              x: 'Tue',
              y: 29,
            },
            {
              x: 'Wed',
              y: 13,
            },
            {
              x: 'Thu',
              y: 32,
            },
            {
              x: 'Fri',
              y: 32,
            },
            {
              x: 'Sat',
              y: 32,
            },
            {
              x: 'Sun',
              y: 32,
            },
          ],
        },
        {
          name: '20',
          data: [
            {
              x: 'Mon',
              y: 22,
              color: '#ff5722',
            },
            {
              x: 'Tue',
              y: 29,
            },
            {
              x: 'Wed',
              y: 13,
            },
            {
              x: 'Thu',
              y: 32,
            },
            {
              x: 'Fri',
              y: 32,
            },
            {
              x: 'Sat',
              y: 32,
            },
            {
              x: 'Sun',
              y: 32,
            },
          ],
        },
        {
          name: '40',
          data: [
            {
              x: 'Mon',
              y: 22,
            },
            {
              x: 'Tue',
              y: 29,
            },
            {
              x: 'Wed',
              y: 13,
            },
            {
              x: 'Thu',
              y: 32,
            },
            {
              x: 'Fri',
              y: 32,
            },
            {
              x: 'Sat',
              y: 32,
            },
            {
              x: 'Sun',
              y: 32,
            },
          ],
        },
        {
          name: '60',
          data: [
            {
              x: 'Mon',
              y: 0,
            },
            {
              x: 'Tue',
              y: 29,
            },
            {
              x: 'Wed',
              y: 13,
            },
            {
              x: 'Thu',
              y: 32,
            },
            {
              x: 'Fri',
              y: 0,
            },
            {
              x: 'Sat',
              y: 0,
            },
            {
              x: 'Sun',
              y: 32,
            },
          ],
        },
        {
          name: '80',
          data: [
            {
              x: 'Mon',
              y: 0,
            },
            {
              x: 'Tue',
              y: 20,
            },
            {
              x: 'Wed',
              y: 13,
            },
            {
              x: 'Thu',
              y: 32,
            },
            {
              x: 'Fri',
              y: 0,
            },
            {
              x: 'Sat',
              y: 0,
            },
            {
              x: 'Sun',
              y: 32,
            },
          ],
        },
        {
          name: '120',
          data: [
            {
              x: 'Mon',
              y: 0,
            },
            {
              x: 'Tue',
              y: 0,
            },
            {
              x: 'Wed',
              y: 75,
            },
            {
              x: 'Thu',
              y: 0,
            },
            {
              x: 'Fri',
              y: 0,
            },
            {
              x: 'Sat',
              y: 0,
            },
            {
              x: 'Sun',
              y: 0,
            },
          ],
        },
      ],
    };
    this.leads_stage = {
      chart: {
        height: 355,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: ['#FF6F28', '#F8F9FA'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          borderRadius: 5,
          borderRadiusWhenStacked: 'all',
          horizontal: false,
          endingShape: 'rounded',
        },
      },
      series: [
        {
          name: 'Income',
          data: [80, 40, 60, 40],
        },
        {
          name: 'Expenses',
          data: [100, 100, 100, 100],
        },
      ],
      xaxis: {
        categories: ['Competitor', 'Budget', 'Unresponsie', 'Timing'],
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '9px',
          },
        },
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: {
            colors: '#6B7280',
            fontSize: '10px',
          },
        },
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 5,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false, // Disable data labels
      },
      fill: {
        opacity: 1,
      },
    };
    this.donut_chart_2 = {
      series: [25, 30, 10, 35], // Percentages for each section
      chart: {
        type: 'donut',
        height: 185,
      },
      labels: ['Paid', 'Google', 'Referals', 'Campaigns'], // Labels for the data
      colors: ['#FFC107', '#0C4B5E', '#AB47BC', '#FD3995'], // Colors from the image
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Google',
                formatter: function () {
                  return '40%';
                },
              },
            },
          },
        },
      },
      stroke: {
        lineCap: 'round',
        show: true,
        width: 0, // Space between donut sections
        colors: '#fff',
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      label: {
        show: false,
      },
    };
    this.donut_chart_3 = {
      series: [15, 10, 5, 10, 60], // Percentages for each section
      chart: {
        type: 'donut',
        height: 290,
      },
      labels: ['Paid', 'Google', 'Referals', 'Campaigns', 'Campaigns'], // Labels for the data
      colors: ['#F26522', '#FFC107', '#E70D0D', '#1B84FF', '#0C4B5E'], // Colors from the image
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Leads',
                formatter: function () {
                  return '589';
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      label: {
        show: false,
      },
    };
  }
}
