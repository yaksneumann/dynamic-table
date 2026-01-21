import {
  Component,
  OnInit,
  signal,
  computed,
  input,
  inject,
  WritableSignal,
  HostListener,
} from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PaginationConfig,
  DetailModalData,
} from '../../models/table-data.interface';
import {
  TableConfig,
  ColumnConfig,
  BadgeConfig,
} from '../../models/table.config.interface';
import { TableService } from '../../services/table.service';
import { STATUS_TYPES, StatusSummary } from '../../models/status-types';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgStyle],
  templateUrl: './smart-table.html',
  styleUrl: './smart-table.css',
})
export class SmartTableComponent<
  T extends { id: string; status?: string; [key: string]: any },
> implements OnInit {
  config = input.required<TableConfig<T>>();
  data = input.required<T[]>();

  private tableService = inject(TableService<T>);

  private allData = signal<T[]>([]);
  isMobile = signal<boolean>(false);
  searchTerm = signal<string>('');

  pagination!: WritableSignal<PaginationConfig>;

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

  get totalPages(): number {
    return Math.ceil(this.filteredData().length / this.pagination().pageSize);
  }

  get currentPageRange(): { start: number; end: number } {
    const start =
      (this.pagination().currentPage - 1) * this.pagination().pageSize + 1;
    const end = Math.min(
      this.pagination().currentPage * this.pagination().pageSize,
      this.filteredData().length,
    );
    return { start, end };
  }

  shouldShowPageButton(pageNumber: number): boolean {
    const currentPage = this.pagination().currentPage;
    return (
      pageNumber === currentPage || Math.abs(pageNumber - currentPage) <= 2
    );
  }

  visibleColumns = computed(() => {
    const cols = this.config().columns;
    const mobile = this.isMobile();
    return mobile ? cols.filter((c) => c.mobileVisible) : cols;
  });

  statusSummary = computed<StatusSummary>(() => {
    const data = this.filteredData();
    const summary: StatusSummary = {
      total: data.length,
    } as StatusSummary;

    STATUS_TYPES.forEach((status) => {
      summary[status] = data.filter((d) => d.status === status).length;
    });

    return summary;
  });

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.loadData();
    this.initializePagination();
    this.checkScreenSize();
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
    this.pagination.update((p: PaginationConfig) => ({ ...p, currentPage: 1 }));
  }

  private loadData() {
    const data = this.data();
    this.allData.set(data);
  }

  private initializePagination() {
    const paginationSettings = this.config().pagination;
    this.pagination = signal<PaginationConfig>({
      currentPage: 1,
      pageSize: paginationSettings.defaultPageSize,
      totalItems: this.allData().length,
      pageSizeOptions: paginationSettings.pageSizeOptions,
    });
  }

  private checkScreenSize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pagination.update((p: PaginationConfig) => ({
        ...p,
        currentPage: page,
      }));
    }
  }

  changePageSize(size: number) {
    this.pagination.update((p: PaginationConfig) => ({
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
      this.tableService.update(modal.data as unknown as T).subscribe({
        next: (updated) => {
          const updatedData = this.allData().map((item) =>
            item.id === updated.id ? updated : item,
          );
          this.allData.set(updatedData);
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
    if (this.config().features.enableDelete) {
      const firstColumn = this.config().columns[0];
      const identifier = firstColumn
        ? this.getCellValue(firstColumn, row)
        : row.id;

      if (confirm(`האם אתה בטוח שברצונך למחוק את: ${identifier}?`)) {
        this.tableService.delete(row.id).subscribe({
          next: () => {
            const updatedData = this.allData().filter(
              (item) => item.id !== row.id,
            );
            this.allData.set(updatedData);
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

  getStatusColor(status: string | undefined): string | undefined {
    if (!status) return undefined;
    const colors = this.config().styling?.statusColors;
    return colors?.[status];
  }

  private getStatusColumn(): ColumnConfig | undefined {
    return this.config().columns.find((c) => c.key === 'status');
  }

  getFormattedStatus(row: T): string {
    const column = this.getStatusColumn();
    return column ? this.getCellValue(column, row) : '';
  }
}
