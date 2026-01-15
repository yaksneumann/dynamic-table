import { Observable } from 'rxjs';

export interface TableConfig<T = any> {
  columns: ColumnConfig[];
  pagination: PaginationSettings;
  features: FeatureFlags;
  styling?: StylingConfig;
}

export interface ColumnConfig {
  key: string;
  header: string;
  type: 'text' | 'number' | 'badge' | 'currency' | 'date' | 'action';
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  mobileVisible?: boolean;
  format?: (value: any, row?: any) => string;
  styleConfig?: ColumnStyleConfig;
}

export interface ColumnStyleConfig {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
  borderRadius?: string;
  condition?: (value: any, row?: any) => boolean;
}

export interface PaginationSettings {
  defaultPageSize: number;
  pageSizeOptions: number[];
  showPageInfo?: boolean;
}

export interface FeatureFlags {
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableExport?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSort?: boolean;
}

export interface StylingConfig {
  statusColors?: Record<string, string>;
  customClasses?: string[];
}

export interface DataSourceService<T> {
  getData(): Observable<T[]>;
  getById(id: string): Observable<T>;
  update(item: T): Observable<T>;
  delete?(id: string): Observable<void>;
}
