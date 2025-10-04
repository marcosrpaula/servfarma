import { Component } from '@angular/core';
import {
  pageSelection,
  pageSize,
  pageSizeCal,
  PaginationService,
} from './pagination.service';
import { routes } from '../routes/routes';

@Component({
  selector: 'app-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss'],
  standalone: false,
})
export class CustomPaginationComponent {
  public routes = routes;
  public pageSize = 10;
  public tableData: Array<string> = [];
  // pagination variables
  public lastIndex = 0;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;
  // pagination variables end

  constructor(private pagination: PaginationService) {
    this.tableData = [];
    this.pagination.tablePageSize.subscribe(({ skip, limit, pageSize }) => {
      if (typeof pageSize === 'number' && pageSize > 0) {
        this.pageSize = pageSize;
      }
      if (typeof skip === 'number' && this.pageSize > 0) {
        this.currentPage = Math.floor(skip / this.pageSize) + 1;
        this.skip = skip;
      }
      if (typeof limit === 'number') {
        this.limit = limit;
      }
    });
    this.pagination.calculatePageSize.subscribe((res: pageSizeCal) => {
      this.calculateTotalPages(
        res.totalData,
        res.pageSize,
        res.tableData,
        res.serialNumberArray,
      );
    });
    this.pagination.changePagesize.subscribe((res: pageSize) => {
      this.changePageSize(res.pageSize);
    });
  }

  public getMoreData(direction: 'next' | 'previous'): void {
    if (direction === 'next') {
      if (this.currentPage >= this.totalPages || this.totalPages === 0) {
        return;
      }
      this.moveToPage(this.currentPage + 1);
    } else {
      if (this.currentPage <= 1) {
        return;
      }
      this.moveToPage(this.currentPage - 1);
    }
  }

  public moveToPage(pageNumber: number): void {
    if (pageNumber === this.currentPage) {
      return;
    }
    if (pageNumber < 1 || (this.totalPages > 0 && pageNumber > this.totalPages)) {
      return;
    }
    const selection = this.pageSelection[pageNumber - 1];
    if (!selection) {
      return;
    }
    this.currentPage = pageNumber;
    this.skip = selection.skip;
    this.limit = selection.limit;
    this.pagination.tablePageSize.next({
      skip: this.skip,
      limit: this.limit,
      pageSize: this.pageSize,
    });
  }

  public changePageSize(size: number): void {
    const updatedSize = Number(size) || this.pageSize || 10;
    this.pageSize = updatedSize;
    this.pageSelection = [];
    this.limit = updatedSize;
    this.skip = 0;
    this.currentPage = 1;
    this.pagination.tablePageSize.next({
      skip: this.skip,
      limit: this.limit,
      pageSize: this.pageSize,
    });
  }

  public calculateTotalPages(
    totalData: number,
    pageSize: number,
    tableData: Array<string>,
    serialNumberArray: Array<number>,
  ): void {
    const size = typeof pageSize === 'number' && pageSize > 0 ? pageSize : this.pageSize;
    this.pageSize = size;
    this.tableData = tableData;
    this.totalData = totalData;
    this.pageNumberArray = [];
    this.pageSelection = [];

    this.totalPages = size > 0 ? Math.ceil(totalData / size) : 0;

    for (let i = 1; i <= this.totalPages; i++) {
      const limit = size * i;
      const skip = limit - size;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip, limit });
    }

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    if (Array.isArray(serialNumberArray) && serialNumberArray.length >= 2) {
      this.serialNumberArray = serialNumberArray.slice(0, 2);
    } else if (tableData.length > 0 && this.totalData > 0) {
      const start = this.skip + 1;
      const end = this.skip + tableData.length;
      this.serialNumberArray = [start, end];
    } else {
      this.serialNumberArray = [];
    }
  }
}

