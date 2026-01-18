import { Component, OnInit, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PaginationConfig,
  DetailModalData,
  StatusSummary,
} from '../../models/table-data.interface';
import {
  TableConfig,
  ColumnConfig,
  DataSourceService,
  BadgeConfig,
} from '../../models/table.config.interface';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smart-table.html',
  styleUrl: './smart-table.css',
})
export class SmartTableComponent<
  T extends { id: string; status?: string; [key: string]: any },
> implements OnInit {
  Math = Math;

  config = input.required<TableConfig<T>>();
  dataSource = input.required<DataSourceService<T>>();

  allData = signal<T[]>([]);
  isMobile = signal<boolean>(false);
  searchTerm = signal<string>('');

  pagination = signal<PaginationConfig>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    pageSizeOptions: [5, 10, 20, 50],
  });

  detailModal = signal<DetailModalData>({
    isOpen: false,
    data: null,
    mode: 'view',
  });

  filteredData = computed(() => {
    const data = this.allData();
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) return data;

    return data.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') {
          return JSON.stringify(value).toLowerCase().includes(search);
        }
        return String(value).toLowerCase().includes(search);
      });
    });
  });

  paginatedData = computed(() => {
    const data = this.filteredData();
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  });

  totalPages = computed(() => {
    const totalItems = this.filteredData().length;
    const { pageSize } = this.pagination();
    return Math.ceil(totalItems / pageSize);
  });

  visibleColumns = computed(() => {
    const cols = this.config().columns;
    const mobile = this.isMobile();
    return mobile ? cols.filter((c) => c.mobileVisible) : cols;
  });

  statusSummary = computed<StatusSummary>(() => {
    const data = this.filteredData();
    return {
      total: data.length,
      ready: data.filter((d) => d.status === 'ready').length,
      inProgress: data.filter((d) => d.status === 'inProgress').length,
      completed: data.filter((d) => d.status === 'completed').length,
    };
  });

  ngOnInit() {
    this.loadData();
    this.initializePagination();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  getBadgeCount(badge: BadgeConfig): number {
    const data = this.filteredData();
    if (badge.filterValue === null || badge.filterValue === undefined) {
      return data.length;
    }

    return data.filter((item) => item[badge.field] === badge.filterValue)
      .length;
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
  }

  loadData() {
    this.dataSource()
      .getData()
      .subscribe((data) => {
        this.allData.set(data);
        this.pagination.update((p) => ({ ...p, totalItems: data.length }));
      });
  }

  initializePagination() {
    const paginationSettings = this.config().pagination;
    this.pagination.update((p) => ({
      ...p,
      pageSize: paginationSettings.defaultPageSize,
      pageSizeOptions: paginationSettings.pageSizeOptions,
    }));
  }

  checkScreenSize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pagination.update((p) => ({ ...p, currentPage: page }));
    }
  }

  changePageSize(size: number) {
    this.pagination.update((p) => ({
      ...p,
      pageSize: size,
      currentPage: 1,
    }));
  }

  openDetail(row: T, mode: 'view' | 'edit' = 'view') {
    this.detailModal.set({
      isOpen: true,
      data: { ...row } as any,
      mode,
    });
  }

  closeDetail() {
    this.detailModal.set({
      isOpen: false,
      data: null,
      mode: 'view',
    });
  }

  saveDetail() {
    const modal = this.detailModal();
    if (modal.data) {
      this.dataSource()
        .update(modal.data as unknown as T)
        .subscribe({
          next: (updated) => {
            this.allData.update((data) =>
              data.map((item) => (item.id === updated.id ? updated : item)),
            );
            this.closeDetail();
          },
          error: (err) => console.error('Update failed:', err),
        });
    }
  }

  handleEdit(row: T) {
    if (this.config().features.enableEdit) {
      this.openDetail(row, 'edit');
    }
  }

  handleDelete(row: T) {
    if (this.config().features.enableDelete && this.dataSource().delete) {
      if (confirm('האם אתה בטוח שברצונך למחוק?')) {
        this.dataSource().delete!(row.id).subscribe({
          next: () => {
            this.allData.update((data) =>
              data.filter((item) => item.id !== row.id),
            );
          },
          error: (err) => console.error('Delete failed:', err),
        });
      }
    }
  }

  getCellStyle(column: ColumnConfig, value: any, row: T): any {
    if (
      column.styleConfig?.condition &&
      column.styleConfig.condition(value, row)
    ) {
      return {
        backgroundColor: column.styleConfig.backgroundColor,
        color: column.styleConfig.textColor,
        fontWeight: column.styleConfig.fontWeight,
        borderRadius: column.styleConfig.borderRadius || '4px',
        padding: '4px 8px',
        display: 'inline-block',
      };
    }
    return {};
  }

  getCellValue(column: ColumnConfig, row: any): string {
    const value = row[column.key];
    if (column.format) {
      return column.format(value, row);
    }

    if (column.type === 'currency') {
      return `₪ ${value.toLocaleString('he-IL')}`;
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('he-IL');
    }

    return value?.toString() || '';
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return '#9E9E9E';

    const colors = this.config().styling?.statusColors;
    if (colors && colors[status]) {
      return colors[status];
    }

    const colorMap: Record<string, string> = {
      ready: '#2196F3',
      inProgress: '#FFC107',
      completed: '#4CAF50',
      urgent: '#F44336',
    };
    return colorMap[status] || '#9E9E9E';
  }

  getStatusColumn(): ColumnConfig | undefined {
    return this.config().columns.find((c) => c.key === 'status');
  }

  getTotalAmountColumn(): ColumnConfig | undefined {
    return this.config().columns.find((c) => c.key === 'totalAmount');
  }

  getFormattedStatus(row: T): string {
    const column = this.getStatusColumn();
    return column ? this.getCellValue(column, row) : '';
  }

  getFormattedAmount(row: T): string {
    const column = this.getTotalAmountColumn();
    return column ? this.getCellValue(column, row) : '';
  }

  getAmountStyle(row: T): any {
    const column = this.getTotalAmountColumn();
    return column ? this.getCellStyle(column, row['totalAmount'], row) : {};
  }

  getDetailStatus(): string {
    const data = this.detailModal().data;
    if (!data) return '';
    return this.getFormattedStatus(data as unknown as T);
  }
}
