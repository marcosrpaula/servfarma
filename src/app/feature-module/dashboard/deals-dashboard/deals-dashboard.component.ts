/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
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
Chart.register(...registerables);
@Component({
  selector: 'app-deals-dashboard',
  templateUrl: './deals-dashboard.component.html',
  styleUrl: './deals-dashboard.component.scss',
  standalone: false,
})
export class DealsDashboardComponent implements OnInit {
  breadCrumbItems: breadCrumbItems[] = [];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  @ViewChild('chart')
  chart!: ChartComponent;
  routes = routes;
  public Areachart: Partial<ChartOptions> | any;
  public Areachart2: Partial<ChartOptions> | any;
  public pipeline_chart: Partial<ChartOptions> | any;
  public deals_stage: Partial<ChartOptions> | any;
  constructor() {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }
  ngOnInit(): void {
    this.dealChart();
    this.breadCrumbItems = [{ label: 'Dashboards' }, { label: 'Deals Dashboard', active: true }];
    this.Areachart = {
      series: [
        {
          name: 'Messages',
          data: [0, 3, 0, 2, 1, 3, 1],
        },
      ],
      fill: {
        type: 'gradient',
      },
      chart: {
        foreColor: '#fff',
        type: 'area',
        width: 50,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: !1,
        },
        dropShadow: {
          enabled: 0,
          top: 3,
          left: 14,
          blur: 4,
          opacity: 0.12,
          color: '#fff',
        },
        sparkline: {
          enabled: !0,
        },
      },
      markers: {
        size: 0,
        colors: ['#F26522'],
        strokeColors: '#fff',
        strokeWidth: 0,
        hover: {
          size: 7,
        },
      },
      plotOptions: {
        bar: {
          horizontal: !1,
          columnWidth: '35%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: !0,
        width: 1,
        curve: 'straight',
      },
      colors: ['#1CCE6B'],

      tooltip: {
        enabled: false,
        hideEmptySeries: true,
        onDatasetHover: {
          highlightDataSeries: false,
        },
      },
    };
    this.Areachart2 = {
      series: [
        {
          name: 'Messages',
          data: [0, 3, 0, 2, 1, 3, 1],
        },
      ],
      fill: {
        type: 'gradient',
      },
      chart: {
        foreColor: '#fff',
        type: 'area',
        width: 50,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: !1,
        },
        dropShadow: {
          enabled: 0,
          top: 3,
          left: 14,
          blur: 4,
          opacity: 0.12,
          color: '#fff',
        },
        sparkline: {
          enabled: !0,
        },
      },
      markers: {
        size: 0,
        colors: ['#F26522'],
        strokeColors: '#fff',
        strokeWidth: 0,
        hover: {
          size: 7,
        },
      },
      plotOptions: {
        bar: {
          horizontal: !1,
          columnWidth: '35%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: !0,
        width: 1,
        curve: 'straight',
      },
      colors: ['#D00C0C'],

      tooltip: {
        enabled: false,
        hideEmptySeries: true,
        onDatasetHover: {
          highlightDataSeries: false,
        },
      },
    };
    this.deals_stage = {
      chart: {
        height: 310,
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
          horizontal: false,
          endingShape: 'rounded',
        },
      },
      series: [
        {
          name: 'Income',
          data: [80, 40, 100, 20],
        },
        {
          name: 'Expenses',
          data: [100, 100, 100, 100],
        },
      ],
      xaxis: {
        categories: ['Inpipeline', 'Follow Up', 'Schedule', 'Conversion'],
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '13px',
          },
        },
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: {
            colors: '#6B7280',
            fontSize: '13px',
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
    this.pipeline_chart = {
      series: [
        {
          name: '',
          data: [1380, 1100, 990, 880, 740, 540],
        },
      ],
      chart: {
        type: 'bar',
        height: 280,
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          distributed: true,
          barHeight: '80%',
          isFunnel: true,
        },
      },
      colors: ['#F26522', '#F37438', '#F5844E', '#F69364', '#F7A37A', '#F9B291'],
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex];
        },
        dropShadow: {
          enabled: true,
        },
      },
      title: {
        align: 'top',
      },
      xaxis: {
        categories: [
          'Marketing : 7,898',
          'Sales : 4658',
          'Email : 2898',
          'Chat : 789',
          'Operational : 655',
          'Calls : 454',
        ],
      },
      legend: {
        show: false,
      },
    };
  }
  dealChart() {
    new Chart('dealChart', {
      type: 'radar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Ayg'], // Common labels for both series
        datasets: [
          {
            label: 'Email', // First series
            data: [40, 70, 20, 40, 40, 70, 40, 60],
            backgroundColor: '#2dcb73',
            borderColor: '#2dcb73',
            pointBackgroundColor: '#2dcb73',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.3,
          },
          {
            label: 'Chat', // Second series
            data: [30, 30, 90, 30, 60, 30, 60, 90],
            backgroundColor: '#4b3088',
            borderColor: '#4b3088',
            pointBackgroundColor: '#4b3088',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.4,
          },
          {
            label: 'Series 3', // Second series
            data: [70, 43, 70, 90, 30, 30, 30, 40],
            backgroundColor: '#F26522',
            borderColor: '#F26522',
            pointBackgroundColor: '#F26522',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          r: {
            angleLines: {
              display: true,
              color: '#e9e9e9', // Color of the radial lines
            },
            grid: {
              circular: true, // Make the grid lines circular
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 30,
            },
          },
        },
        plugins: {
          legend: {
            display: false, // This hides the legend
          },
        },
      },
    });
  }
}
