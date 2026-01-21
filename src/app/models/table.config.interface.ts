export interface TableConfig<T = any> {
  columns: ColumnConfig[];
  pagination: PaginationSettings;
  features: FeatureFlags;
  styling?: StylingConfig;
  badges?: BadgeConfig[];
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
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSort?: boolean;
}

export interface StylingConfig {
  statusColors?: Record<string, string>;
  customClasses?: string[];
}

export interface BadgeConfig {
  label: string;
  field: string;
  filterValue?: any;
  styles?: {
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    border?: string;
  };
}
