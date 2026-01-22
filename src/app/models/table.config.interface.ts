type BivariantCallback<T extends (...args: any[]) => any> = {
  bivarianceHack(...args: Parameters<T>): ReturnType<T>;
}['bivarianceHack'];

export type ColumnKey<T> = (keyof T & string) | 'actions';

export type EditMode = 'inline' | 'expanded' | 'modal';

export interface TableConfig<T = Record<string, unknown>> {
  columns: ColumnConfig<T>[];
  pagination: PaginationSettings;
  features: FeatureFlags;
  dataMode?: 'client' | 'server';
  editMode?: EditMode;
  virtualization?: VirtualizationSettings;
  selection?: SelectionConfig<T>;
  exports?: ExportConfig;
  statePersistence?: 'none' | 'url' | 'storage';
  stateKey?: string;
  diagnostics?: DiagnosticsConfig;
  styling?: StylingConfig;
  filterPresets?: FilterPreset<T>[];
  searchConfig?: SearchConfig<T>;
  statusTypes?: string[];
}

export interface ColumnConfig<T = Record<string, unknown>> {
  key: ColumnKey<T>;
  header: string;
  type: 'text' | 'number' | 'badge' | 'currency' | 'date' | 'action';
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  mobileVisible?: boolean;
  hideable?: boolean;
  hidden?: boolean;
  draggable?: boolean;
  format?: BivariantCallback<(value: unknown, row?: T) => string>;
  styleConfig?: ColumnStyleConfig<T>;
}

export interface ColumnStyleConfig<T = Record<string, unknown>> {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
  borderRadius?: string;
  condition?: BivariantCallback<(value: unknown, row?: T) => boolean>;
}

export interface PaginationSettings {
  defaultPageSize: number;
  pageSizeOptions: number[];
  showPageInfo?: boolean;
}

export interface VirtualizationSettings {
  enabled?: boolean;
  itemSize: number;
  mobileItemSize?: number;
  maxViewportHeight?: number;
}

export interface FeatureFlags {
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableSearch?: boolean;
  enableSelection?: boolean;
  showTotalCount?: boolean;
  enableRowReorder?: boolean;
  enableFilters?: boolean;
  enableSort?: boolean;
  enableMobileInfiniteScroll?: boolean;
}

export interface ExportConfig {
  enableCsv?: boolean;
  enableExcel?: boolean;
  enablePrint?: boolean;
  fileName?: string;
}

export interface DiagnosticsConfig {
  enabled?: boolean;
}

export interface SelectionConfig<T = Record<string, unknown>> {
  mode?: 'single' | 'multiple';
  trackBy?: BivariantCallback<(row: T) => string>;
}

export interface TableQueryParams<T = Record<string, unknown>> {
  searchTerm: string;
  page: number;
  pageSize: number;
  sort?: SortState<T>;
  filters?: TableFilters<T>;
  searchColumns?: ColumnKey<T>[];
  searchMode?: 'any' | 'all';
}

export interface TableDataSourceResult<T = Record<string, unknown>> {
  items: T[];
  total?: number;
}

export interface TableDataSource<T = Record<string, unknown>> {
  load: (
    params: TableQueryParams<T>,
  ) =>
    | TableDataSourceResult<T>
    | T[]
    | Promise<TableDataSourceResult<T> | T[]>
    | import('rxjs').Observable<TableDataSourceResult<T> | T[]>;
}

export interface SortState<T = Record<string, unknown>> {
  key: ColumnKey<T>;
  direction: 'asc' | 'desc';
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty';

export interface FilterCondition<T = Record<string, unknown>> {
  field: keyof T & string;
  operator: FilterOperator;
  value?: unknown;
  valueTo?: unknown;
  caseSensitive?: boolean;
}

export interface FilterGroup<T = Record<string, unknown>> {
  logic: 'and' | 'or';
  conditions: Array<FilterCondition<T> | FilterGroup<T>>;
}

export type TableFilters<T = Record<string, unknown>> =
  | Record<string, unknown>
  | FilterGroup<T>;

export interface FilterPreset<T = Record<string, unknown>> {
  id: string;
  label: string;
  filters: TableFilters<T>;
}

export interface StylingConfig {
  statusColors?: Record<string, string>;
  customClasses?: string[];
}

export interface SearchConfig<T = Record<string, unknown>> {
  mode?: 'any' | 'all';
  columns?: ColumnKey<T>[];
}

