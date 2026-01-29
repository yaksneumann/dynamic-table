/**
 * Bivariant callback type to support Angular's callback parameter compatibility.
 * Enables both contravariant and covariant parameter typing for callbacks.
 */
type BivariantCallback<T extends (...args: any[]) => any> = {
  bivarianceHack(...args: Parameters<T>): ReturnType<T>;
}['bivarianceHack'];

/**
 * Valid column key types - either a string key from the data type T or the special 'actions' column.
 */
export type ColumnKey<T> = (keyof T & string) | 'actions';

/**
 * Available edit modes for table rows.
 * - inline: Edit cells directly within the row
 * - expanded: Show edit form below the row
 * - modal: Open edit form in a modal dialog
 */
export type EditMode = 'inline' | 'expanded' | 'modal';

/**
 * Main configuration interface for the smart table component.
 * @template T The data type for table rows
 */
export interface TableConfig<T = Record<string, unknown>> {
  /** Array of column configurations defining table structure */
  columns: ColumnConfig<T>[];
  /** Pagination settings and options */
  pagination: PaginationSettings;
  /** Feature flags to enable/disable table capabilities */
  features: FeatureFlags;
  /** Data handling mode - 'client' for client-side or 'server' for server-side operations */
  dataMode?: 'client' | 'server';
  /** Row editing mode */
  editMode?: EditMode;
  /** Virtual scrolling configuration for large datasets */
  virtualization?: VirtualizationSettings;
  /** Row selection configuration */
  selection?: SelectionConfig<T>;
  /** Data export options (CSV, Excel, Print) */
  exports?: ExportConfig;
  /** Where to persist table state - 'none', 'url' (query params), or 'storage' (localStorage) */
  statePersistence?: 'none' | 'url' | 'storage';
  /** Unique key for storing table state when using storage persistence */
  stateKey?: string;
  /** Diagnostics panel configuration */
  diagnostics?: DiagnosticsConfig;
  /** Custom styling options */
  styling?: StylingConfig;
  /** Search behavior configuration */
  searchConfig?: SearchConfig<T>;
  /** Array of valid status type values for badge columns */
  statusTypes?: string[];
}

/**
 * Configuration for a single table column.
 * @template T The data type for table rows
 */
export interface ColumnConfig<T = Record<string, unknown>> {
  /** Unique identifier - must match a property key in T or 'actions' for action column */
  key: ColumnKey<T>;
  /** Display text shown in the column header */
  header: string;
  /** Column data type determines rendering and formatting behavior */
  type: 'text' | 'number' | 'badge' | 'currency' | 'date' | 'action';
  /** Fixed width (e.g., '100px', '20%') - optional, defaults to auto */
  width?: string;
  /** Text alignment within cells */
  align?: 'left' | 'center' | 'right';
  /** Whether column can be sorted by clicking header */
  sortable?: boolean;
  /** Whether column is visible on mobile devices */
  mobileVisible?: boolean;
  /** Whether users can hide/show this column via column selector */
  hideable?: boolean;
  /** Initial visibility state - true means column starts hidden */
  hidden?: boolean;
  /** Whether column can be reordered via drag and drop */
  draggable?: boolean;
  /** Custom formatting function to transform cell values for display */
  format?: BivariantCallback<(value: unknown, row?: T) => string>;
  /** Conditional styling configuration for cells in this column */
  styleConfig?: ColumnStyleConfig<T>;
  /** Optional Material Icon name to display in edit mode inputs */
  icon?: string;
}

/**
 * Conditional styling configuration for column cells.
 * @template T The data type for table rows
 */
export interface ColumnStyleConfig<T = Record<string, unknown>> {
  /** Background color (e.g., '#fff', 'red', 'var(--primary)') */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Font weight (e.g., 'bold', '600', 'normal') */
  fontWeight?: string;
  /** Border radius for rounded corners */
  borderRadius?: string;
  /** Optional condition function - styles only apply when this returns true */
  condition?: BivariantCallback<(value: unknown, row?: T) => boolean>;
}

/**
 * Pagination configuration settings.
 */
export interface PaginationSettings {
  /** Initial/default number of rows per page */
  defaultPageSize: number;
  /** Available page size options shown in selector dropdown */
  pageSizeOptions: number[];
  /** Whether to show "Showing X-Y of Z" text */
  showPageInfo?: boolean;
}

/**
 * Virtual scrolling settings for performance with large datasets.
 * Virtual scrolling only renders visible rows in the viewport.
 */
export interface VirtualizationSettings {
  /** Whether to enable virtual scrolling */
  enabled?: boolean;
  /** Height in pixels of each row for desktop view */
  itemSize: number;
  /** Height in pixels of each card for mobile view */
  mobileItemSize?: number;
  /** Maximum height of the scrollable viewport in pixels */
  maxViewportHeight?: number;
}

/**
 * Feature flags to control table capabilities.
 * All features are optional and default to false/disabled when not specified.
 */
export interface FeatureFlags {
  /** Enable edit button in action column */
  enableEdit?: boolean;
  /** Enable delete button in action column */
  enableDelete?: boolean;
  /** Enable search input and functionality */
  enableSearch?: boolean;
  /** Enable row selection with checkboxes */
  enableSelection?: boolean;
  /** Show total record count above table */
  showTotalCount?: boolean;
  /** Enable drag handles for reordering rows */
  enableRowReorder?: boolean;
  /** Enable advanced filters panel */
  enableFilters?: boolean;
  /** Enable column sorting */
  enableSort?: boolean;
  /** Enable infinite scroll on mobile instead of pagination */
  enableMobileInfiniteScroll?: boolean;
}

/**
 * Data export configuration.
 */
export interface ExportConfig {
  /** Enable CSV export button */
  enableCsv?: boolean;
  /** Enable Excel export button */
  enableExcel?: boolean;
  /** Enable print button */
  enablePrint?: boolean;
  /** Default filename for exported files (without extension) */
  fileName?: string;
}

/**
 * Diagnostics panel configuration.
 * Shows performance metrics and debug information.
 */
export interface DiagnosticsConfig {
  /** Whether to show the diagnostics panel */
  enabled?: boolean;
}

/**
 * Row selection configuration.
 * @template T The data type for table rows
 */
export interface SelectionConfig<T = Record<string, unknown>> {
  /** Selection mode - 'single' allows one row, 'multiple' allows many */
  mode?: 'single' | 'multiple';
  /** Function to generate unique identifier for each row (for selection tracking) */
  trackBy?: BivariantCallback<(row: T) => string>;
}

/**
 * Query parameters passed to data source when loading data.
 * Used for server-side or client-side data operations.
 * @template T The data type for table rows
 */
export interface TableQueryParams<T = Record<string, unknown>> {
  /** Current search term entered by user */
  searchTerm: string;
  /** Current page number (1-based) */
  page: number;
  /** Number of rows per page */
  pageSize: number;
  /** Current sort state (column and direction) */
  sort?: SortState<T>;
  /** Active filter conditions */
  filters?: TableFilters<T>;
  /** Specific columns to search in (empty = search all) */
  searchColumns?: ColumnKey<T>[];
  /** Search mode - 'any' matches if term found in any column, 'all' requires match in all columns */
  searchMode?: 'any' | 'all';
}

/**
 * Result returned from data source load function.
 * @template T The data type for table rows
 */
export interface TableDataSourceResult<T = Record<string, unknown>> {
  /** Array of data items for current page */
  items: T[];
  /** Total number of items across all pages (for pagination info) */
  total?: number;
}

/**
 * Data source interface for loading table data.
 * Supports synchronous arrays, Promises, or RxJS Observables.
 * @template T The data type for table rows
 */
export interface TableDataSource<T = Record<string, unknown>> {
  /**
   * Load function called when data needs to be fetched/filtered.
   * Can return data directly, as Promise, or as Observable.
   * Return value can be array of items or object with items + total.
   */
  load: (
    params: TableQueryParams<T>,
  ) =>
    | TableDataSourceResult<T>
    | T[]
    | Promise<TableDataSourceResult<T> | T[]>
    | import('rxjs').Observable<TableDataSourceResult<T> | T[]>;
}

/**
 * Current sort state for a column.
 * @template T The data type for table rows
 */
export interface SortState<T = Record<string, unknown>> {
  /** Column being sorted */
  key: ColumnKey<T>;
  /** Sort direction - ascending or descending */
  direction: 'asc' | 'desc';
}

/**
 * Supported filter operators for advanced filtering.
 * Different operators work with different data types.
 */
export type FilterOperator =
  | 'eq' // Equal to
  | 'neq' // Not equal to
  | 'contains' // String contains (or array contains item)
  | 'startsWith' // String starts with
  | 'endsWith' // String ends with
  | 'gt' // Greater than (numbers/dates)
  | 'gte' // Greater than or equal (numbers/dates)
  | 'lt' // Less than (numbers/dates)
  | 'lte' // Less than or equal (numbers/dates)
  | 'between' // Between two values (requires value and valueTo)
  | 'in' // In list of values
  | 'notIn' // Not in list of values
  | 'isEmpty' // Field is null, undefined, empty string, or empty array
  | 'isNotEmpty'; // Field is not empty

/**
 * A single filter condition for advanced filtering.
 * @template T The data type for table rows
 */
export interface FilterCondition<T = Record<string, unknown>> {
  /** Field/column to filter on */
  field: keyof T & string;
  /** Comparison operator */
  operator: FilterOperator;
  /** Primary value for comparison (required for most operators except isEmpty/isNotEmpty) */
  value?: unknown;
  /** Second value for 'between' operator */
  valueTo?: unknown;
  /** Whether string comparisons should be case-sensitive (default: false) */
  caseSensitive?: boolean;
}

/**
 * Group of filter conditions combined with AND/OR logic.
 * Can be nested to create complex filter expressions.
 * @template T The data type for table rows
 */
export interface FilterGroup<T = Record<string, unknown>> {
  /** Logical operator - 'and' requires all conditions true, 'or' requires any condition true */
  logic: 'and' | 'or';
  /** Array of conditions or nested groups */
  conditions: Array<FilterCondition<T> | FilterGroup<T>>;
}

/**
 * Filter specification - can be simple key-value pairs or complex FilterGroup.
 * Simple format: { columnKey: value } for equality checks.
 * Advanced format: FilterGroup with operators and logic.
 * @template T The data type for table rows
 */
export type TableFilters<T = Record<string, unknown>> =
  | Record<string, unknown>
  | FilterGroup<T>;

/**
 * Custom styling configuration for the table.
 */
export interface StylingConfig {
  /** Color mapping for badge status types (e.g., { 'Active': '#4caf50', 'Inactive': '#f44336' }) */
  statusColors?: Record<string, string>;
  /** Array of custom CSS class names to apply to the table */
  customClasses?: string[];
  /** Date picker color customization */
  datePickerColors?: DatePickerColors;
}

/**
 * Color customization options for date picker component.
 */
export interface DatePickerColors {
  /** Primary color for selected dates and accents (default: '#e53935' - matches table red theme) */
  primary?: string;
  /** Secondary color for hover states */
  secondary?: string;
  /** Calendar header background color */
  headerBackground?: string;
  /** Calendar header text color */
  headerText?: string;
  /** Today's date highlight color */
  todayColor?: string;
}

/**
 * Search behavior configuration.
 * @template T The data type for table rows
 */
export interface SearchConfig<T = Record<string, unknown>> {
  /** Default search mode - 'any' or 'all' */
  mode?: 'any' | 'all';
  /** Default columns to search in (empty = all columns) */
  columns?: ColumnKey<T>[];
}
