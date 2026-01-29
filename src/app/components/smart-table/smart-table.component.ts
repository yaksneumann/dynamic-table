import {
  Component,
  signal,
  computed,
  input,
  inject,
  effect,
  OnInit,
  Injector,
  output,
  TemplateRef,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PaginationConfig,
  DetailModalData,
} from '../../models/table-data.interface';
import {
  TableConfig,
  ColumnConfig,
  VirtualizationSettings,
  TableDataSource,
  TableDataSourceResult,
  TableQueryParams,
  SelectionConfig,
  ExportConfig,
  SortState,
  TableFilters,
  FilterGroup,
  FilterCondition,
  SearchConfig,
  EditMode,
} from '../../models/table.config.interface';
import { TableService } from '../../services/table.service';
import { DEFAULT_STATUS_TYPES, StatusSummary } from '../../models/status-types';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  distinctUntilChanged,
  from,
  fromEvent,
  isObservable,
  map,
  of,
  startWith,
  take,
  catchError,
  finalize,
} from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DatePickerComponent } from '../date-picker/date-picker.component';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    DragDropModule,
    DatePickerComponent,
  ],
  templateUrl: './smart-table.html',
  styleUrl: './smart-table.css',
})
export class SmartTableComponent<
  T extends { id: string; status?: string },
> implements OnInit {
  // Inputs
  config = input.required<TableConfig<T>>();
  clientData = input<T[] | null>(null);
  serverDataSource = input<TableDataSource<T> | null>(null);

  headerTemplate = input<TemplateRef<{
    $implicit: ColumnConfig<T>;
    column: ColumnConfig<T>;
  }> | null>(null);
  cellTemplate = input<TemplateRef<{
    $implicit: T;
    row: T;
    column: ColumnConfig<T>;
    value: unknown;
    index: number;
  }> | null>(null);
  actionTemplate = input<TemplateRef<{
    $implicit: T;
    row: T;
    index: number;
  }> | null>(null);
  emptyTemplate = input<TemplateRef<{}> | null>(null);
  mobileCardTemplate = input<TemplateRef<{
    $implicit: T;
    row: T;
    index: number;
  }> | null>(null);

  rowClick = output<T>();
  cellClick = output<{ row: T; column: ColumnConfig<T>; value: unknown }>();
  actionClick = output<{ row: T; action: 'edit' | 'delete' }>();
  selectionChange = output<string[]>();
  rowReorder = output<{
    previousIndex: number;
    currentIndex: number;
    items: T[];
  }>();

  // Services
  private tableService = inject(TableService<T>);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);

  // Private state
  private allData = signal<T[]>([]);
  private lastQueryKey = signal<string>('');
  private lastFiltersKey = signal<string>('');
  private hasRestoredState = false;
  private restoredFilters = signal<TableFilters<T> | null>(null);
  private advancedFilters = signal<FilterGroup<T> | null>(null);

  // Public state - UI controls
  searchTerm = signal<string>('');
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isColumnPanelOpen = signal<boolean>(false);
  isSearchPanelOpen = signal<boolean>(false);
  isFilterPanelOpen = signal<boolean>(false);

  // Public state - data filtering & sorting
  sortState = signal<SortState<T> | null>(null);
  filtersState = signal<TableFilters<T>>({});
  searchColumns = signal<ColumnConfig<T>['key'][]>([]);
  searchMode = signal<'any' | 'all'>('any');

  // Public state - pagination & scrolling
  pagination = signal<PaginationConfig>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    pageSizeOptions: [5, 10, 20, 50],
  });
  mobileVisibleCount = signal<number>(0);
  mobileScrollIndex = signal<number>(0);

  // Public state - editing & selection
  editingRowId = signal<string | null>(null);
  editingRowData = signal<T | null>(null);
  selectedIds = signal<Set<string>>(new Set());
  focusedIndex = signal<number>(0);

  // Public state - modal & UI
  detailModal = signal<DetailModalData<T>>({
    isOpen: false,
    data: null,
    mode: 'view',
  });

  // Public state - column management
  columnOrder = signal<ColumnConfig<T>['key'][]>([]);
  hiddenColumns = signal<Set<ColumnConfig<T>['key']>>(new Set());

  // Public state - diagnostics
  lastQueryParams = signal<TableQueryParams<T> | null>(null);
  lastQueryDuration = signal<number | null>(null);
  isDiagnosticsPanelOpen = signal(false);

  // Computed - internal
  private resolvedClientData = computed<T[]>(() => this.clientData() ?? []);
  private resolvedServerDataSource = computed<TableDataSource<T> | null>(() =>
    this.serverDataSource(),
  );

  // Computed - data processing
  filteredData = computed(() => {
    if (this.isServerMode()) {
      return this.allData();
    }

    let data = this.allData();
    data = this.applyFilters(data);
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) return data;

    const searchableColumns = this.getSearchableColumns();
    const selected = this.getSearchColumns(searchableColumns);
    const mode = this.searchMode();

    return data.filter((row) => {
      const matches = selected.map((column) => {
        const value = column.format
          ? column.format(this.getColumnValue(column, row), row)
          : this.getColumnValue(column, row);
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') {
          return JSON.stringify(value).toLowerCase().includes(search);
        }
        return String(value).toLowerCase().includes(search);
      });
      return mode === 'all' ? matches.every(Boolean) : matches.some(Boolean);
    });
  });

  sortedData = computed(() => {
    if (this.isServerMode()) {
      return this.allData();
    }
    return this.applySort(this.filteredData());
  });

  paginatedData = computed(() => {
    const data = this.sortedData();
    const { currentPage, pageSize } = this.pagination();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  });

  displayedData = computed(() => {
    if (this.isVirtualScrollEnabled()) {
      return this.sortedData();
    }

    if (this.mobileInfiniteEnabled()) {
      const total = this.sortedData();
      return total.slice(0, this.mobileVisibleCount());
    }

    if (!this.showPagination()) {
      return this.sortedData();
    }

    return this.paginatedData();
  });

  // Computed - configuration
  editMode = computed<EditMode>(() => this.config().editMode ?? 'modal');

  isServerMode = computed(() => this.config().dataMode === 'server');

  isVirtualScrollEnabled = computed(
    () => this.config().virtualization?.enabled === true,
  );

  mobileInfiniteEnabled = computed(
    () =>
      this.isMobile() &&
      this.config().features.enableMobileInfiniteScroll === true,
  );

  isMobileVirtualScroll = computed(
    () => this.isVirtualScrollEnabled() || this.mobileInfiniteEnabled(),
  );

  selectionConfig = computed<SelectionConfig<T>>(() => {
    const config = this.config().selection;
    return {
      mode: config?.mode ?? 'multiple',
      trackBy: config?.trackBy,
    };
  });

  isSelectionEnabled = computed(
    () =>
      this.config().features.enableSelection === true ||
      !!this.config().selection,
  );

  selectionMode = computed(() => this.selectionConfig().mode ?? 'multiple');

  virtualizationSettings = computed<VirtualizationSettings>(() => {
    const settings = this.config().virtualization;
    return {
      enabled: settings?.enabled ?? false,
      itemSize: settings?.itemSize ?? 52,
      mobileItemSize: settings?.mobileItemSize ?? 160,
      maxViewportHeight: settings?.maxViewportHeight ?? 520,
    };
  });

  canReorderRows = computed(
    () =>
      this.config().features.enableRowReorder === true &&
      !this.isVirtualScrollEnabled(),
  );

  exportConfig = computed(() => this.getExportConfig());

  diagnosticsEnabled = computed(
    () => this.config().diagnostics?.enabled === true,
  );

  toggleDiagnosticsPanel() {
    this.isDiagnosticsPanelOpen.update((isOpen) => !isOpen);
  }

  filterableColumns = computed<ColumnConfig<T>[]>(() =>
    this.getSearchableColumns(),
  );

  searchableColumns = computed(() => this.getSearchableColumns());

  datePickerColors = computed(() => this.config().styling?.datePickerColors);

  showPagination = computed(
    () => !this.isVirtualScrollEnabled() && !this.isMobile(),
  );

  visibleColumns = computed(() => {
    const cols = this.orderedColumns();
    const mobile = this.isMobile();
    return mobile
      ? cols.filter((c) => c.mobileVisible && !this.isColumnHidden(c))
      : cols.filter((c) => !this.isColumnHidden(c));
  });

  orderedColumns = computed(() => {
    const columns = this.config().columns;
    const order = this.columnOrder();
    if (!order.length) {
      return columns;
    }

    const mapByKey = new Map(columns.map((col) => [col.key, col]));
    const ordered = order
      .map((key) => mapByKey.get(key))
      .filter((col): col is ColumnConfig<T> => !!col);

    const missing = columns.filter((col) => !order.includes(col.key));
    return [...ordered, ...missing];
  });

  statusSummary = computed<StatusSummary>(() => {
    const data = this.filteredData();
    const summary: StatusSummary = {
      total: data.length,
    } as StatusSummary;

    const statuses = this.config().statusTypes ?? DEFAULT_STATUS_TYPES;
    statuses.forEach((status) => {
      summary[status] = data.filter((d) => d.status === status).length;
    });

    return summary;
  });

  // Computed - pagination & metrics
  maxRowIndex = computed(() => Math.max(0, this.displayedData().length - 1));

  totalPages = computed(() => {
    const totalItems = this.isServerMode()
      ? this.pagination().totalItems
      : this.filteredData().length;
    return Math.max(1, Math.ceil(totalItems / this.pagination().pageSize));
  });

  currentPageRange = computed(() => {
    const totalItems = this.isServerMode()
      ? this.pagination().totalItems
      : this.filteredData().length;

    if (totalItems === 0) {
      return { start: 0, end: 0 };
    }

    const start =
      (this.pagination().currentPage - 1) * this.pagination().pageSize + 1;
    const end = Math.min(
      this.pagination().currentPage * this.pagination().pageSize,
      totalItems,
    );
    return { start, end };
  });

  totalItems = computed(() =>
    this.isServerMode()
      ? this.pagination().totalItems
      : this.filteredData().length,
  );

  visibleItems = computed(() => this.displayedData().length);

  diagnosticsVisibleLabel = computed(() =>
    this.mobileInfiniteEnabled() ? 'View' : 'Visible',
  );

  diagnosticsVisibleText = computed(() => {
    const total = this.totalItems();
    if (total === 0) return '0 / 0';

    if (this.mobileInfiniteEnabled()) {
      const loaded = this.visibleItems();
      const start = Math.min(loaded, this.mobileScrollIndex() + 1);
      const end = Math.min(
        loaded,
        this.mobileScrollIndex() + Math.max(1, this.pagination().pageSize),
      );
      return `${start}-${end} / ${total}`;
    }

    return `${this.visibleItems()} / ${total}`;
  });

  ariaRowCount = computed(() => this.totalItems());

  ariaColCount = computed(
    () =>
      this.visibleColumns().length +
      (this.isSelectionEnabled() ? 1 : 0) +
      (this.canReorderRows() ? 1 : 0),
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  diagnosticsPage = computed(() => {
    if (this.mobileInfiniteEnabled()) {
      const pageSize = this.pagination().pageSize;
      return Math.max(1, Math.floor(this.mobileScrollIndex() / pageSize) + 1);
    }
    return this.pagination().currentPage;
  });

  // Constants
  private readonly exportDefaults: Required<ExportConfig> = {
    enableCsv: true,
    enableExcel: true,
    enablePrint: true,
    fileName: 'table-export',
  };

  readonly filterOperatorOptions: Array<{
    value: FilterCondition<T>['operator'];
    label: string;
  }> = [
    { value: 'contains', label: 'מכיל' },
    { value: 'eq', label: 'שווה' },
    { value: 'neq', label: 'לא שווה' },
    { value: 'startsWith', label: 'מתחיל ב-' },
    { value: 'endsWith', label: 'מסתיים ב-' },
    { value: 'gt', label: 'גדול מ-' },
    { value: 'gte', label: 'גדול או שווה' },
    { value: 'lt', label: 'קטן מ-' },
    { value: 'lte', label: 'קטן או שווה' },
    { value: 'between', label: 'בין' },
    { value: 'in', label: 'ברשימה' },
    { value: 'notIn', label: 'לא ברשימה' },
    { value: 'isEmpty', label: 'ריק' },
    { value: 'isNotEmpty', label: 'לא ריק' },
  ];

  // Mobile detection
  readonly isMobile = toSignal(
    this.document.defaultView
      ? fromEvent(this.document.defaultView, 'resize').pipe(
          startWith(null),
          map(() => this.document.defaultView!.innerWidth < 768),
          distinctUntilChanged(),
        )
      : of(false),
    {
      initialValue: this.document.defaultView
        ? this.document.defaultView.innerWidth < 768
        : false,
    },
  );

  // Lifecycle

  ngOnInit() {
    this.initializeEffects();
    this.restoreState();
  }

  private initializeEffects() {
    effect(
      () => {
        if (this.isServerMode()) {
          return;
        }

        const data = this.resolvedClientData();
        this.allData.set(data ?? []);
        this.pagination.update((p) => ({
          ...p,
          totalItems: data?.length ?? 0,
          currentPage: 1,
        }));
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const paginationSettings = this.config().pagination;
        this.pagination.update((p) => ({
          ...p,
          currentPage: this.hasRestoredState ? p.currentPage : 1,
          pageSize: this.hasRestoredState
            ? p.pageSize
            : paginationSettings.defaultPageSize,
          pageSizeOptions: paginationSettings.pageSizeOptions,
        }));
        if (this.mobileInfiniteEnabled()) {
          const size = this.pagination().pageSize;
          if (!this.hasRestoredState || this.mobileVisibleCount() === 0) {
            this.mobileVisibleCount.set(size);
          }
        }
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const cols = this.config().columns;
        if (!this.hasRestoredState) {
          this.columnOrder.set(cols.map((col) => col.key));
          const hidden = new Set<ColumnConfig<T>['key']>();
          cols.forEach((col) => {
            if (col.hidden) {
              hidden.add(col.key);
            }
          });
          this.hiddenColumns.set(hidden);
        }
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const searchConfig = this.config().searchConfig;
        if (!this.hasRestoredState) {
          this.searchMode.set(searchConfig?.mode ?? 'any');
          if (searchConfig?.columns && searchConfig.columns.length > 0) {
            this.searchColumns.set(
              searchConfig.columns as ColumnConfig<T>['key'][],
            );
          } else {
            const defaultCols = this.getDefaultSearchColumns();
            this.searchColumns.set(defaultCols);
          }
        }
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const advanced = this.advancedFilters();
        const restored = this.restoredFilters();

        const resolved = this.resolveFilters(null, advanced, null, restored);
        const key = JSON.stringify(resolved ?? {});
        if (this.lastFiltersKey() === key) return;

        this.lastFiltersKey.set(key);
        this.filtersState.set(resolved ?? {});
        if (resolved !== restored) {
          this.restoredFilters.set(null);
        }
        this.pagination.update((p) => ({ ...p, currentPage: 1 }));
        this.resetMobileInfinite();
      },
      { injector: this.injector },
    );

    effect(
      () => {
        if (!this.hasRestoredState) return;
        this.persistState();
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const totalPages = this.totalPages();
        const currentPage = this.pagination().currentPage;
        if (currentPage > totalPages) {
          this.pagination.update((p) => ({ ...p, currentPage: totalPages }));
        }
      },
      { injector: this.injector },
    );

    effect(
      () => {
        if (!this.isServerMode()) {
          return;
        }

        const source = this.resolvedServerDataSource();
        if (!source) {
          this.errorMessage.set('אין מקור נתונים לטעינה');
          return;
        }

        const query: TableQueryParams<T> = {
          searchTerm: this.searchTerm(),
          page: this.diagnosticsPage(),
          pageSize: this.pagination().pageSize,
          sort: this.sortState() ?? undefined,
          filters: this.hasActiveFilters() ? this.filtersState() : undefined,
          searchColumns: this.getSearchColumns(this.getSearchableColumns()).map(
            (column) => column.key,
          ),
          searchMode: this.searchMode(),
        };

        if (this.diagnosticsEnabled()) {
          this.lastQueryParams.set(query);
        }

        const queryKey = JSON.stringify(query);
        if (this.lastQueryKey() === queryKey) {
          return;
        }

        this.lastQueryKey.set(queryKey);
        const append =
          this.mobileInfiniteEnabled() && this.pagination().currentPage > 1;
        this.loadFromDataSource(source, query, append);
      },
      { injector: this.injector },
    );

    effect(
      () => {
        if (!this.diagnosticsEnabled()) {
          return;
        }

        if (this.isServerMode()) {
          return;
        }

        const start = performance.now();
        const query: TableQueryParams<T> = {
          searchTerm: this.searchTerm(),
          page: this.pagination().currentPage,
          pageSize: this.pagination().pageSize,
          sort: this.sortState() ?? undefined,
          filters: this.hasActiveFilters() ? this.filtersState() : undefined,
          searchColumns: this.getSearchColumns(this.getSearchableColumns()).map(
            (column) => column.key,
          ),
          searchMode: this.searchMode(),
        };
        this.lastQueryParams.set(query);
        this.filteredData();
        this.lastQueryDuration.set(performance.now() - start);
      },
      { injector: this.injector },
    );
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.pagination.update((p: PaginationConfig) => ({ ...p, currentPage: 1 }));
    this.resetMobileInfinite();
  }

  toggleSort(column: ColumnConfig<T>) {
    if (!this.config().features.enableSort || !column.sortable) return;
    const current = this.sortState();
    if (!current || current.key !== column.key) {
      this.sortState.set({ key: column.key, direction: 'asc' });
      this.pagination.update((p) => ({ ...p, currentPage: 1 }));
      this.resetMobileInfinite();
      return;
    }

    if (current.direction === 'asc') {
      this.sortState.set({ key: column.key, direction: 'desc' });
      this.pagination.update((p) => ({ ...p, currentPage: 1 }));
      this.resetMobileInfinite();
      return;
    }

    this.sortState.set(null);
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.resetMobileInfinite();
  }

  getSortDirection(column: ColumnConfig<T>): 'asc' | 'desc' | null {
    const current = this.sortState();
    if (!current || current.key !== column.key) return null;
    return current.direction;
  }

  getAriaSort(
    column: ColumnConfig<T>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) return null;
    const direction = this.getSortDirection(column);
    if (direction === 'asc') return 'ascending';
    if (direction === 'desc') return 'descending';
    return 'none';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
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
    this.resetMobileInfinite();
  }

  openDetail(row: T, mode: 'view' | 'edit' = 'view') {
    this.detailModal.set({
      isOpen: true,
      data: { ...row },
      mode,
    });

    setTimeout(() => this.focusModalFirstElement(), 0);
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

  isInlineEditMode(): boolean {
    return this.editMode() === 'inline';
  }

  isExpandedEditMode(): boolean {
    return this.editMode() === 'expanded';
  }

  isModalEditMode(): boolean {
    return this.editMode() === 'modal';
  }

  isRowEditing(row: T): boolean {
    return this.editingRowId() === row.id;
  }

  startRowEdit(row: T) {
    this.editingRowId.set(row.id);
    this.editingRowData.set({ ...row });
  }

  cancelRowEdit() {
    this.editingRowId.set(null);
    this.editingRowData.set(null);
  }

  saveRowEdit() {
    const data = this.editingRowData();
    if (!data) return;
    this.tableService.update(data as T).subscribe({
      next: (updated) => {
        const updatedData = this.allData().map((item) =>
          item.id === updated.id ? updated : item,
        );
        this.allData.set(updatedData);
        this.cancelRowEdit();
      },
      error: (err) => console.error('Update failed:', err),
    });
  }

  getEditingValue(column: ColumnConfig<T>, row: T): unknown {
    if (!this.isRowEditing(row)) {
      return this.getColumnValue(column, row);
    }
    const data = this.editingRowData();
    if (!data) return this.getColumnValue(column, row);
    return (data as Record<string, unknown>)[column.key];
  }

  updateEditingValue(column: ColumnConfig<T>, value: unknown) {
    const data = this.editingRowData();
    if (!data) return;
    this.editingRowData.set({
      ...data,
      [column.key]: value,
    } as T);
  }

  handleEdit(row: T) {
    if (this.config().features.enableEdit) {
      this.actionClick.emit({ row, action: 'edit' });
      if (this.isModalEditMode()) {
        this.openDetail(row, 'edit');
        return;
      }

      if (this.isExpandedEditMode() && this.isVirtualScrollEnabled()) {
        this.openDetail(row, 'edit');
        return;
      }

      this.startRowEdit(row);
    }
  }

  handleDelete(row: T) {
    if (this.config().features.enableDelete) {
      this.actionClick.emit({ row, action: 'delete' });
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

  getCellStyle(
    column: ColumnConfig<T>,
    value: unknown,
    row: T,
  ): Record<string, string | undefined> {
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

  getCellValue(column: ColumnConfig<T>, row: T): string {
    const value = this.getColumnValue(column, row);
    if (column.format) {
      return column.format(value, row);
    }

    if (column.type === 'currency') {
      return typeof value === 'number'
        ? `₪ ${value.toLocaleString('he-IL')}`
        : value?.toString() || '';
    }

    if (column.type === 'date' && value) {
      if (value instanceof Date) {
        return value.toLocaleDateString('he-IL');
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value).toLocaleDateString('he-IL');
      }
    }

    return value?.toString() || '';
  }

  /**
   * Get Material Icon name for a column in edit mode.
   * Returns column.icon if specified, otherwise infers from column.key or column.type.
   */
  getFieldIcon(column: ColumnConfig<T>): string {
    // Use explicitly configured icon if available
    if (column.icon) {
      return column.icon;
    }

    const key = column.key.toLowerCase();

    // Type-based icons
    if (
      column.type === 'currency' ||
      key.includes('amount') ||
      key.includes('salary') ||
      key.includes('סכום')
    ) {
      return 'attach_money';
    }

    // Key-based pattern matching (English and Hebrew)
    if (key.includes('phone') || key.includes('טלפון')) return 'phone';
    if (key.includes('email') || key.includes('מייל')) return 'email';
    if (key.includes('address') || key.includes('כתובת')) return 'location_on';
    if (key.includes('name') || key.includes('שם')) return 'person';
    if (key.includes('facility') || key.includes('מתקן')) return 'business';
    if (key.includes('hub') || key.includes('מוקד')) return 'support_agent';
    if (key.includes('delivery') || key.includes('מסירה'))
      return 'local_shipping';
    if (key.includes('contact') || key.includes('קשר')) return 'contacts';
    if (key.includes('bag') || key.includes('שק')) return 'shopping_bag';
    if (key.includes('department') || key.includes('מחלקה'))
      return 'corporate_fare';
    if (key.includes('position') || key.includes('תפקיד')) return 'work';
    if (key === 'status' || key === 'סטטוס') return 'label';

    // Default icon
    return 'edit';
  }

  getStatusColor(status: unknown): string | undefined {
    if (typeof status !== 'string') return undefined;
    const colors = this.config().styling?.statusColors;
    return colors?.[status];
  }

  private getStatusColumn(): ColumnConfig<T> | undefined {
    return this.config().columns.find((c) => c.key === 'status');
  }

  getFormattedStatus(row: T): string {
    const column = this.getStatusColumn();
    return column ? this.getCellValue(column, row) : '';
  }

  setDetailMode(mode: 'view' | 'edit') {
    this.detailModal.update((modal) => ({ ...modal, mode }));
    setTimeout(() => this.focusModalFirstElement(), 0);
  }

  onRowClick(row: T) {
    this.rowClick.emit(row);
  }

  onCellClick(column: ColumnConfig<T>, row: T) {
    this.cellClick.emit({
      row,
      column,
      value: this.getColumnValue(column, row),
    });
  }

  isRowFocused(index: number): boolean {
    return this.focusedIndex() === index;
  }

  setFocusedIndex(index: number) {
    const next = Math.max(0, Math.min(index, this.maxRowIndex()));
    this.focusedIndex.set(next);
    this.focusRowByIndex(next);
  }

  onRowFocus(index: number) {
    this.focusedIndex.set(index);
  }

  onRowKeydown(event: KeyboardEvent, row: T, index: number) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.setFocusedIndex(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.setFocusedIndex(index - 1);
        break;
      case 'PageDown':
        event.preventDefault();
        this.setFocusedIndex(index + this.pagination().pageSize);
        break;
      case 'PageUp':
        event.preventDefault();
        this.setFocusedIndex(index - this.pagination().pageSize);
        break;
      case 'Home':
        event.preventDefault();
        this.setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.setFocusedIndex(this.maxRowIndex());
        break;
      case 'Enter':
        event.preventDefault();
        this.onRowClick(row);
        break;
      case ' ':
        if (this.isSelectionEnabled()) {
          event.preventDefault();
          this.toggleRowSelection(row);
        }
        break;
      default:
        break;
    }
  }

  isRowSelected(row: T): boolean {
    return this.selectedIds().has(this.getRowSelectionKey(row));
  }

  toggleRowSelection(row: T) {
    if (!this.isSelectionEnabled()) {
      return;
    }

    const key = this.getRowSelectionKey(row);
    const next = new Set(this.selectedIds());

    if (this.selectionMode() === 'single') {
      if (next.has(key)) {
        next.clear();
      } else {
        next.clear();
        next.add(key);
      }
    } else {
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
    }

    this.selectedIds.set(next);
    this.selectionChange.emit(Array.from(next));
  }

  areAllSelected(): boolean {
    const rows = this.displayedData();
    if (!rows.length) return false;
    return rows.every((row) =>
      this.selectedIds().has(this.getRowSelectionKey(row)),
    );
  }

  toggleAllSelection() {
    if (!this.isSelectionEnabled() || this.selectionMode() !== 'multiple') {
      return;
    }

    const rows = this.displayedData();
    const next = new Set(this.selectedIds());

    if (rows.every((row) => next.has(this.getRowSelectionKey(row)))) {
      rows.forEach((row) => next.delete(this.getRowSelectionKey(row)));
    } else {
      rows.forEach((row) => next.add(this.getRowSelectionKey(row)));
    }

    this.selectedIds.set(next);
    this.selectionChange.emit(Array.from(next));
  }

  onMobileScrolled(index: number) {
    if (!this.mobileInfiniteEnabled()) return;
    this.mobileScrollIndex.set(index);
    if (this.diagnosticsEnabled()) {
      const pageSize = this.pagination().pageSize;
      this.lastQueryParams.set({
        searchTerm: this.searchTerm(),
        page: Math.max(1, Math.floor(index / pageSize) + 1),
        pageSize,
        sort: this.sortState() ?? undefined,
        filters: this.hasActiveFilters() ? this.filtersState() : undefined,
        searchColumns: this.getSearchColumns(this.getSearchableColumns()).map(
          (column) => column.key,
        ),
        searchMode: this.searchMode(),
      });
      this.lastQueryDuration.set(0);
    }

    if (this.loading()) return;

    const threshold = Math.max(1, this.pagination().pageSize - 2);
    if (index + threshold < this.displayedData().length) return;

    if (this.isServerMode()) {
      if (this.displayedData().length >= this.pagination().totalItems) return;
      this.pagination.update((p) => ({ ...p, currentPage: p.currentPage + 1 }));
      return;
    }

    const start = this.diagnosticsEnabled() ? performance.now() : 0;
    const total = this.sortedData().length;
    const next = Math.min(
      total,
      this.mobileVisibleCount() + this.pagination().pageSize,
    );
    if (next !== this.mobileVisibleCount()) {
      this.mobileVisibleCount.set(next);
      if (this.diagnosticsEnabled()) {
        this.lastQueryDuration.set(performance.now() - start);
      }
    }
  }

  private resetMobileInfinite() {
    if (!this.mobileInfiniteEnabled()) return;
    this.mobileVisibleCount.set(this.pagination().pageSize);
    if (this.isServerMode()) {
      this.allData.set([]);
      this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    }
  }

  getExportConfig(): Required<ExportConfig> {
    return { ...this.exportDefaults, ...(this.config().exports ?? {}) };
  }

  exportCsv(): void {
    const { fileName } = this.getExportConfig();
    const { columns, rows } = this.getExportData();
    const header = columns.map((c) => `"${c.header}"`).join(',');
    const lines = rows.map((row) =>
      columns
        .map((col) => {
          const value = this.getColumnValue(col, row);
          return `"${String(value ?? '').replace(/"/g, '""')}"`;
        })
        .join(','),
    );
    const csv = [header, ...lines].join('\n');
    this.downloadFile(`${fileName}.csv`, 'text/csv;charset=utf-8;', csv);
  }

  exportExcel(): void {
    const { fileName } = this.getExportConfig();
    const { columns, rows } = this.getExportData();
    const header = columns.map((c) => `<th>${c.header}</th>`).join('');
    const body = rows
      .map(
        (row) =>
          `<tr>${columns
            .map((col) => `<td>${this.getColumnValue(col, row) ?? ''}</td>`)
            .join('')}</tr>`,
      )
      .join('');
    const html = `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
    this.downloadFile(
      `${fileName}.xls`,
      'application/vnd.ms-excel;charset=utf-8;',
      html,
    );
  }

  printTable(): void {
    const { columns, rows } = this.getExportData();
    const header = columns.map((c) => `<th>${c.header}</th>`).join('');
    const body = rows
      .map(
        (row) =>
          `<tr>${columns
            .map((col) => `<td>${this.getColumnValue(col, row) ?? ''}</td>`)
            .join('')}</tr>`,
      )
      .join('');
    const html = `
      <html>
        <head>
          <title>הדפסה</title>
          <style>
            table { width: 100%; border-collapse: collapse; direction: rtl; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
          </style>
        </head>
        <body>
          <table>
            <thead><tr>${header}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </body>
      </html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  private getRowSelectionKey(row: T): string {
    const trackBy = this.selectionConfig().trackBy;
    return trackBy ? trackBy(row) : row.id;
  }

  private focusRowByIndex(index: number) {
    const element = this.document.querySelector(
      `[data-row-index="${index}"]`,
    ) as HTMLElement | null;
    element?.focus();
  }

  onModalKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusable = this.getModalFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusModalFirstElement() {
    const focusable = this.getModalFocusableElements();
    focusable[0]?.focus();
  }

  private getModalFocusableElements(): HTMLElement[] {
    const modal = this.document.querySelector('.modal-content');
    if (!modal) return [];
    return Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  private getSearchableColumns(): ColumnConfig<T>[] {
    return this.config().columns.filter(
      (column) => column.type !== 'action' && column.key !== 'actions',
    );
  }

  private getSearchColumns(searchable: ColumnConfig<T>[]): ColumnConfig<T>[] {
    const selected = this.searchColumns();
    if (!selected.length) return searchable;
    const selectedSet = new Set(selected);
    const resolved = searchable.filter((col) => selectedSet.has(col.key));
    return resolved.length ? resolved : searchable;
  }

  private getDefaultSearchColumns(): ColumnConfig<T>['key'][] {
    return this.getSearchableColumns().map((col) => col.key);
  }

  toggleFilterPanel() {
    this.isFilterPanelOpen.update((open) => !open);
  }

  getAdvancedFilterLogic(): 'and' | 'or' {
    return this.advancedFilters()?.logic ?? 'and';
  }

  getAdvancedFilterConditions(): FilterCondition<T>[] {
    const group = this.advancedFilters();
    if (!group) return [];
    return group.conditions.filter(
      (condition): condition is FilterCondition<T> =>
        !this.isFilterGroup(condition),
    );
  }

  setAdvancedFilterLogic(value: 'and' | 'or') {
    const group = this.getOrCreateAdvancedGroup();
    this.advancedFilters.set({ ...group, logic: value });
  }

  addAdvancedCondition() {
    const group = this.getOrCreateAdvancedGroup();
    const firstColumn = this.filterableColumns()[0];
    if (!firstColumn) return;
    const next: FilterCondition<T> = {
      field: firstColumn.key as keyof T & string,
      operator: 'contains',
      value: '',
    };
    this.advancedFilters.set({
      ...group,
      conditions: [...group.conditions, next],
    });
  }

  removeAdvancedCondition(index: number) {
    const group = this.getOrCreateAdvancedGroup();
    const next = group.conditions.filter((_, idx) => idx !== index);
    if (next.length === 0) {
      this.advancedFilters.set(null);
      return;
    }
    this.advancedFilters.set({ ...group, conditions: next });
  }

  updateAdvancedConditionField(index: number, field: string) {
    this.updateAdvancedCondition(index, { field: field as keyof T & string });
  }

  updateAdvancedConditionOperator(
    index: number,
    operator: FilterCondition<T>['operator'],
  ) {
    const patch: Partial<FilterCondition<T>> = { operator };
    if (operator === 'isEmpty' || operator === 'isNotEmpty') {
      patch.value = undefined;
      patch.valueTo = undefined;
    }
    this.updateAdvancedCondition(index, patch);
  }

  updateAdvancedConditionValue(index: number, value: unknown) {
    this.updateAdvancedCondition(index, { value });
  }

  updateAdvancedConditionValueTo(index: number, value: unknown) {
    this.updateAdvancedCondition(index, { valueTo: value });
  }

  clearAdvancedFilters() {
    this.advancedFilters.set(null);
  }

  needsValue(operator: FilterCondition<T>['operator']): boolean {
    return operator !== 'isEmpty' && operator !== 'isNotEmpty';
  }

  needsValueTo(operator: FilterCondition<T>['operator']): boolean {
    return operator === 'between';
  }

  private getOrCreateAdvancedGroup(): FilterGroup<T> {
    const current = this.advancedFilters();
    if (current && current.conditions.every((c) => !this.isFilterGroup(c))) {
      return current as FilterGroup<T>;
    }
    return {
      logic: current?.logic ?? 'and',
      conditions: current
        ? current.conditions.filter((c) => !this.isFilterGroup(c))
        : [],
    } as FilterGroup<T>;
  }

  private updateAdvancedCondition(
    index: number,
    patch: Partial<FilterCondition<T>>,
  ) {
    const group = this.getOrCreateAdvancedGroup();
    const next = group.conditions.map((condition, idx) =>
      idx === index
        ? { ...(condition as FilterCondition<T>), ...patch }
        : condition,
    ) as Array<FilterCondition<T>>;
    this.advancedFilters.set({ ...group, conditions: next });
  }

  shouldShowPageButton(pageNumber: number): boolean {
    const currentPage = this.pagination().currentPage;
    return (
      pageNumber === currentPage || Math.abs(pageNumber - currentPage) <= 2
    );
  }

  private resolveFilters(
    simple: Record<string, unknown> | null,
    advanced: FilterGroup<T> | null,
    presetFilters: TableFilters<T> | null,
    restored: TableFilters<T> | null,
  ): TableFilters<T> | null {
    const sources: TableFilters<T>[] = [];

    if (presetFilters) sources.push(presetFilters);
    if (advanced) sources.push(advanced);
    if (simple && this.hasSimpleFilters(simple)) sources.push(simple);

    if (sources.length === 0) {
      return restored;
    }

    if (sources.length === 1) {
      return sources[0];
    }

    const allSimple = sources.every((item) => !this.isFilterGroup(item));
    if (allSimple) {
      return sources.reduce<Record<string, unknown>>(
        (acc, item) => ({ ...acc, ...(item as Record<string, unknown>) }),
        {},
      );
    }

    return {
      logic: 'and',
      conditions: sources.map((item) =>
        this.isFilterGroup(item)
          ? item
          : this.simpleFiltersToGroup(item as Record<string, unknown>),
      ),
    };
  }

  private isFilterGroup(filters: unknown): filters is FilterGroup<T> {
    return (
      typeof filters === 'object' &&
      filters !== null &&
      'logic' in filters &&
      'conditions' in filters
    );
  }

  private hasSimpleFilters(filters: Record<string, unknown>): boolean {
    return Object.values(filters).some(
      (value) => value !== null && value !== undefined && value !== '',
    );
  }

  private simpleFiltersToGroup(
    filters: Record<string, unknown>,
  ): FilterGroup<T> {
    return {
      logic: 'and',
      conditions: Object.entries(filters)
        .filter(
          ([, value]) => value !== null && value !== undefined && value !== '',
        )
        .map(([key, value]) => ({
          field: key as keyof T & string,
          operator: 'eq',
          value,
        })),
    };
  }

  private hasActiveFilters(): boolean {
    const filters = this.filtersState();
    if (this.isFilterGroup(filters)) {
      return filters.conditions.length > 0;
    }
    return this.hasSimpleFilters(filters as Record<string, unknown>);
  }

  private applyFilters(data: T[]): T[] {
    if (!this.hasActiveFilters()) return data;
    const filters = this.filtersState();
    if (this.isFilterGroup(filters)) {
      return data.filter((row) => this.evaluateFilterGroup(filters, row));
    }

    return data.filter((row) => {
      return Object.entries(filters as Record<string, unknown>).every(
        ([key, value]) => {
          if (value === null || value === undefined || value === '')
            return true;
          const rowValue = (row as Record<string, unknown>)[key];
          if (Array.isArray(rowValue)) {
            return rowValue.includes(value);
          }
          if (typeof rowValue === 'string') {
            return rowValue.toLowerCase().includes(String(value).toLowerCase());
          }
          return rowValue === value;
        },
      );
    });
  }

  private evaluateFilterGroup(group: FilterGroup<T>, row: T): boolean {
    const checks = group.conditions.map((condition) =>
      this.isFilterGroup(condition)
        ? this.evaluateFilterGroup(condition, row)
        : this.evaluateCondition(condition as FilterCondition<T>, row),
    );
    return group.logic === 'and' ? checks.every(Boolean) : checks.some(Boolean);
  }

  private evaluateCondition(condition: FilterCondition<T>, row: T): boolean {
    const rowValue = (row as Record<string, unknown>)[condition.field];
    const { operator, value, valueTo, caseSensitive } = condition;

    if (operator === 'isEmpty') {
      return (
        rowValue === null ||
        rowValue === undefined ||
        rowValue === '' ||
        (Array.isArray(rowValue) && rowValue.length === 0)
      );
    }

    if (operator === 'isNotEmpty') {
      return !(
        rowValue === null ||
        rowValue === undefined ||
        rowValue === '' ||
        (Array.isArray(rowValue) && rowValue.length === 0)
      );
    }

    if (operator === 'in' || operator === 'notIn') {
      const list = Array.isArray(value) ? value : [value];
      const contains = list.some((item) =>
        this.areEqual(rowValue, item, caseSensitive),
      );
      return operator === 'in' ? contains : !contains;
    }

    if (operator === 'contains') {
      if (Array.isArray(rowValue)) {
        return rowValue.some((item) =>
          this.areEqual(item, value, caseSensitive),
        );
      }
      return this.toComparableString(rowValue, caseSensitive).includes(
        this.toComparableString(value, caseSensitive),
      );
    }

    if (operator === 'startsWith') {
      return this.toComparableString(rowValue, caseSensitive).startsWith(
        this.toComparableString(value, caseSensitive),
      );
    }

    if (operator === 'endsWith') {
      return this.toComparableString(rowValue, caseSensitive).endsWith(
        this.toComparableString(value, caseSensitive),
      );
    }

    if (operator === 'between') {
      if (value === undefined || valueTo === undefined) return true;
      const current = this.toComparableNumber(rowValue);
      const min = this.toComparableNumber(value);
      const max = this.toComparableNumber(valueTo);
      if (current === null || min === null || max === null) return false;
      return current >= min && current <= max;
    }

    if (
      operator === 'gt' ||
      operator === 'gte' ||
      operator === 'lt' ||
      operator === 'lte'
    ) {
      const current = this.toComparableNumber(rowValue);
      const target = this.toComparableNumber(value);
      if (current === null || target === null) return false;
      if (operator === 'gt') return current > target;
      if (operator === 'gte') return current >= target;
      if (operator === 'lt') return current < target;
      return current <= target;
    }

    if (operator === 'neq') {
      return !this.areEqual(rowValue, value, caseSensitive);
    }

    return this.areEqual(rowValue, value, caseSensitive);
  }

  private areEqual(
    left: unknown,
    right: unknown,
    caseSensitive?: boolean,
  ): boolean {
    if (left == null || right == null) return left === right;

    if (typeof left === 'string' || typeof right === 'string') {
      return (
        this.toComparableString(left, caseSensitive) ===
        this.toComparableString(right, caseSensitive)
      );
    }

    const leftNumber = this.toComparableNumber(left);
    const rightNumber = this.toComparableNumber(right);
    if (leftNumber !== null && rightNumber !== null) {
      return leftNumber === rightNumber;
    }

    return left === right;
  }

  private toComparableString(value: unknown, caseSensitive?: boolean): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return caseSensitive ? str : str.toLowerCase();
  }

  private toComparableNumber(value: unknown): number | null {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.getTime();
    }
    return null;
  }

  private applySort(data: T[]): T[] {
    const sort = this.sortState();
    if (!sort) return data;
    const direction = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof T;
    const column = this.config().columns.find((col) => col.key === sort.key);
    return [...data].sort((a, b) => {
      const av = column
        ? column.format
          ? column.format(this.getColumnValue(column, a), a)
          : this.getColumnValue(column, a)
        : (a[key] as unknown);
      const bv = column
        ? column.format
          ? column.format(this.getColumnValue(column, b), b)
          : this.getColumnValue(column, b)
        : (b[key] as unknown);
      if (av === bv) return 0;
      if (av === null || av === undefined) return -1 * direction;
      if (bv === null || bv === undefined) return 1 * direction;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * direction;
      }
      return (
        String(av).localeCompare(String(bv), 'he', { numeric: true }) *
        direction
      );
    });
  }

  private getStatePersistenceMode(): 'none' | 'url' | 'storage' {
    return this.config().statePersistence ?? 'none';
  }

  private getStateKey(): string {
    return this.config().stateKey ?? 'default';
  }

  private restoreState() {
    if (this.hasRestoredState) return;
    const mode = this.getStatePersistenceMode();
    if (mode === 'none') {
      this.hasRestoredState = true;
      return;
    }

    const state = this.readState(mode) ?? this.readState('storage');
    if (state) {
      if (typeof state.searchTerm === 'string') {
        this.searchTerm.set(state.searchTerm);
      }

      if (typeof state.pageSize === 'number' && state.pageSize > 0) {
        const pageSize = state.pageSize;
        this.pagination.update((p) => ({ ...p, pageSize }));
      }

      if (typeof state.page === 'number' && state.page > 0) {
        const currentPage = state.page;
        this.pagination.update((p) => ({ ...p, currentPage }));
      }

      if (Array.isArray(state.columnOrder) && state.columnOrder.length) {
        this.columnOrder.set(state.columnOrder as ColumnConfig<T>['key'][]);
      }

      if (Array.isArray(state.hiddenColumns)) {
        this.hiddenColumns.set(
          new Set(state.hiddenColumns as ColumnConfig<T>['key'][]),
        );
      }

      if (state.sort && typeof state.sort === 'object') {
        const sort = state.sort as SortState<T>;
        if (sort.key && sort.direction) {
          this.sortState.set(sort);
        }
      }

      if (state.filters && typeof state.filters === 'object') {
        this.restoredFilters.set(state.filters as TableFilters<T>);
      }

      if (Array.isArray(state.searchColumns)) {
        this.searchColumns.set(state.searchColumns as ColumnConfig<T>['key'][]);
      }

      if (state.searchMode === 'any' || state.searchMode === 'all') {
        this.searchMode.set(state.searchMode);
      }
    }

    this.hasRestoredState = true;
  }

  private persistState() {
    const mode = this.getStatePersistenceMode();
    if (mode === 'none') return;

    const state = {
      searchTerm: this.searchTerm(),
      page: this.pagination().currentPage,
      pageSize: this.pagination().pageSize,
      columnOrder: this.columnOrder(),
      hiddenColumns: Array.from(this.hiddenColumns()),
      sort: this.sortState(),
      filters: this.filtersState(),
      searchColumns: this.searchColumns(),
      searchMode: this.searchMode(),
    };

    if (mode === 'storage') {
      this.writeStorage(state);
      return;
    }

    if (mode === 'url') {
      this.writeUrl(state);
      this.writeStorage(state);
    }
  }

  private readState(mode: 'url' | 'storage'): {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    columnOrder?: Array<ColumnConfig<T>['key']>;
    hiddenColumns?: Array<ColumnConfig<T>['key']>;
    sort?: SortState<T> | null;
    filters?: TableFilters<T> | null;
    searchColumns?: Array<ColumnConfig<T>['key']>;
    searchMode?: 'any' | 'all';
  } | null {
    if (mode === 'storage') {
      const raw = this.document.defaultView?.localStorage.getItem(
        this.getStorageKey(),
      );
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }

    const view = this.document.defaultView;
    if (!view) return null;
    const params = new URLSearchParams(view.location.search);
    const raw = params.get(this.getUrlKey());
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }

  private writeStorage(state: unknown) {
    this.document.defaultView?.localStorage.setItem(
      this.getStorageKey(),
      JSON.stringify(state),
    );
  }

  private writeUrl(state: unknown) {
    const view = this.document.defaultView;
    if (!view) return;
    const params = new URLSearchParams(view.location.search);
    params.set(this.getUrlKey(), encodeURIComponent(JSON.stringify(state)));
    const newUrl = `${view.location.pathname}?${params.toString()}`;
    view.history.replaceState({}, '', newUrl);
  }

  private getStorageKey(): string {
    return `smartTableState:${this.getStateKey()}`;
  }

  private getUrlKey(): string {
    return `tableState_${this.getStateKey()}`;
  }

  private getExportData() {
    const columns = this.config().columns.filter(
      (column) => column.key !== 'actions' && column.type !== 'action',
    );
    const rows = this.filteredData();
    return { columns, rows };
  }

  private downloadFile(fileName: string, mime: string, content: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private loadFromDataSource(
    source: TableDataSource<T>,
    query: TableQueryParams<T>,
    append: boolean,
  ) {
    this.loading.set(true);
    this.errorMessage.set(null);

    const start = this.diagnosticsEnabled() ? performance.now() : 0;

    const result = source.load(query);
    const result$ = this.normalizeDataSourceResult(result);

    result$
      .pipe(
        take(1),
        catchError((error) => {
          this.errorMessage.set('שגיאה בטעינת הנתונים');
          console.error('Table data source error:', error);
          return of({ items: [] } as TableDataSourceResult<T>);
        }),
        finalize(() => {
          this.loading.set(false);
          if (this.diagnosticsEnabled()) {
            this.lastQueryDuration.set(performance.now() - start);
          }
        }),
      )
      .subscribe((payload) => {
        const normalized = this.normalizePayload(payload);
        if (append) {
          this.allData.set([...this.allData(), ...normalized.items]);
        } else {
          this.allData.set(normalized.items);
        }
        this.pagination.update((p) => ({
          ...p,
          totalItems: this.isServerMode()
            ? (normalized.total ?? 0)
            : (normalized.total ?? normalized.items.length),
        }));
      });
  }

  private normalizeDataSourceResult(
    result:
      | TableDataSourceResult<T>
      | T[]
      | Promise<TableDataSourceResult<T> | T[]>
      | import('rxjs').Observable<TableDataSourceResult<T> | T[]>,
  ) {
    if (isObservable(result)) {
      return result;
    }

    if (result && typeof (result as Promise<unknown>).then === 'function') {
      return from(result as Promise<TableDataSourceResult<T> | T[]>);
    }

    return of(result as TableDataSourceResult<T> | T[]);
  }

  private normalizePayload(
    payload: TableDataSourceResult<T> | T[],
  ): TableDataSourceResult<T> {
    if (Array.isArray(payload)) {
      return { items: payload };
    }

    return payload;
  }

  getColumnValue(column: ColumnConfig<T>, row: T): unknown {
    if (column.key === 'actions') {
      return undefined;
    }

    return row[column.key as keyof T];
  }

  trackById(_: number, row: T) {
    return row.id;
  }

  toggleColumnPanel() {
    this.isColumnPanelOpen.update((open) => !open);
  }

  toggleSearchPanel() {
    this.isSearchPanelOpen.update((open) => !open);
  }

  setSearchMode(mode: 'any' | 'all') {
    if (this.searchMode() === mode) return;
    this.searchMode.set(mode);
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.resetMobileInfinite();
  }

  toggleSearchColumn(column: ColumnConfig<T>) {
    const current = new Set(this.searchColumns());
    if (current.has(column.key)) {
      current.delete(column.key);
    } else {
      current.add(column.key);
    }

    if (current.size === 0) {
      this.searchColumns.set([column.key]);
    } else {
      this.searchColumns.set(Array.from(current));
    }
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.resetMobileInfinite();
  }

  isSearchColumnSelected(column: ColumnConfig<T>): boolean {
    return this.searchColumns().includes(column.key);
  }

  isColumnHidden(column: ColumnConfig<T>): boolean {
    if (column.type === 'action' || column.key === 'actions') return false;
    return this.hiddenColumns().has(column.key);
  }

  canToggleColumn(column: ColumnConfig<T>): boolean {
    if (column.type === 'action' || column.key === 'actions') return false;
    return column.hideable !== false;
  }

  toggleColumnVisibility(column: ColumnConfig<T>) {
    if (!this.canToggleColumn(column)) return;
    const next = new Set(this.hiddenColumns());
    if (next.has(column.key)) {
      next.delete(column.key);
    } else {
      next.add(column.key);
    }
    this.hiddenColumns.set(next);
  }

  onColumnDrop(event: CdkDragDrop<ColumnConfig<T>[]>) {
    const columns = this.orderedColumns();
    const reordered = [...columns];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.columnOrder.set(reordered.map((col) => col.key));
  }

  onRowDrop(event: CdkDragDrop<T[]>) {
    if (!this.canReorderRows()) {
      return;
    }

    if (this.sortState()) {
      this.sortState.set(null);
    }

    const rows = event.container?.data?.length
      ? event.container.data
      : this.displayedData();
    if (rows.length < 2) return;

    const previousRow = rows[event.previousIndex];
    const currentRow = rows[event.currentIndex];
    if (!previousRow || !currentRow) return;

    const all = [...this.allData()];
    const previousIndex = all.findIndex((item) => item.id === previousRow.id);
    const currentIndex = all.findIndex((item) => item.id === currentRow.id);
    if (previousIndex === -1 || currentIndex === -1) return;
    moveItemInArray(all, previousIndex, currentIndex);
    this.allData.set(all);

    this.rowReorder.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      items: rows,
    });
  }
}
