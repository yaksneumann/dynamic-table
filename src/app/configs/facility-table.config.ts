import { TableConfig } from '../models/table.config.interface';
import { FacilityData } from '../models/table-data.interface';

export const facilityTableConfig: TableConfig<FacilityData> = {
  dataMode: 'client',
  editMode: 'expanded',
  columns: [
    {
      key: 'id',
      header: 'מזהה משימה',
      type: 'text',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'facilityName',
      header: 'שם מתקן',
      type: 'text',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'hubName',
      header: 'מוקד מרכז',
      type: 'text',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'deliveryType',
      header: 'סוג מסירה',
      type: 'text',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'contactName',
      header: 'איש קשר',
      type: 'text',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'contactPhone',
      header: 'טלפון',
      type: 'text',
      sortable: false,
      mobileVisible: false,
      // Optional: Explicitly set icon for edit mode
      // icon: 'phone',  // Material icon name (auto-detected if not specified)
    },
    {
      key: 'address',
      header: 'כתובת',
      type: 'text',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'bagCount',
      header: 'שקים',
      type: 'number',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'totalAmount',
      header: 'סכום כולל',
      type: 'currency',
      sortable: true,
      mobileVisible: true,
      format: (value: number) => `₪ ${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => typeof value === 'number' && value > 100000,
        backgroundColor: '#ffebee',
        textColor: '#c62828',
      },
    },
    {
      key: 'status',
      header: 'סטטוס',
      type: 'badge',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'actions',
      header: 'פעולות',
      type: 'action',
      sortable: false,
      mobileVisible: true,
    },
  ],

  pagination: {
    defaultPageSize: 6,
    pageSizeOptions: [6, 10, 20, 50],
    showPageInfo: true,
  },

  virtualization: {
    enabled: false,
    itemSize: 52,
    mobileItemSize: 160,
    maxViewportHeight: 520,
  },

  features: {
    enableEdit: true,
    enableDelete: false,
    enableSearch: true,
    showTotalCount: false,
    enableFilters: true,
    enableSort: true,
    enableRowReorder: true,
    enableMobileInfiniteScroll: true,
  },

  styling: {
    statusColors: {
      מוכן: '#4CAF50',
      בתהליך: '#2196F3',
      הושלם: '#9C27B0',
      דחוף: '#F44336',
    },
  },

  diagnostics: {
    enabled: true,
  },

  statusTypes: ['מוכן', 'בתהליך', 'הושלם', 'דחוף'],
};
