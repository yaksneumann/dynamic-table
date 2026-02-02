import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationConfig } from '../../models/table-data.interface';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  pagination = input.required<PaginationConfig>();
  totalItems = input.required<number>();

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => {
    const total = this.totalItems();
    const pageSize = this.pagination().pageSize;
    return Math.max(1, Math.ceil(total / pageSize));
  });

  currentPageRange = computed(() => {
    const total = this.totalItems();
    if (total === 0) {
      return { start: 0, end: 0 };
    }

    const currentPage = this.pagination().currentPage;
    const pageSize = this.pagination().pageSize;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);
    return { start, end };
  });

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  changePageSize(size: number): void {
    this.pageSizeChange.emit(size);
  }

  shouldShowPageButton(pageNumber: number): boolean {
    const currentPage = this.pagination().currentPage;
    return (
      pageNumber === currentPage || Math.abs(pageNumber - currentPage) <= 2
    );
  }

  isFirstPage(): boolean {
    return this.pagination().currentPage === 1;
  }

  isLastPage(): boolean {
    return this.pagination().currentPage === this.totalPages();
  }

  isActivePage(page: number): boolean {
    return page === this.pagination().currentPage;
  }
}
