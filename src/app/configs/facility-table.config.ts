import { TableConfig } from '../models/table.config.interface';

export const facilityTableConfig: TableConfig = {
  columns: [
    {
      key: 'id',
      header: 'מזהה משימה',
      type: 'text',
      width: '120px',
      align: 'right',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'facilityName',
      header: 'שם המתקן',
      type: 'text',
      width: '200px',
      align: 'right',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'status',
      header: 'סטטוס',
      type: 'badge',
      width: '120px',
      align: 'center',
      sortable: true,
      mobileVisible: true,
      format: (value: string) => {
        const statusMap: Record<string, string> = {
          ready: 'מוכן',
          inProgress: 'בתהליך',
          completed: 'הושלם',
          urgent: 'דחוף',
        };
        return statusMap[value] || value;
      },
      styleConfig: {
        condition: (value) => value === 'urgent',
        backgroundColor: '#fee',
        textColor: '#c00',
      },
    },
    {
      key: 'totalAmount',
      header: 'סכום כולל',
      type: 'currency',
      width: '130px',
      align: 'center',
      sortable: true,
      mobileVisible: true,
      format: (value: number) => `₪ ${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => value > 100000,
        backgroundColor: '#ffebee',
        textColor: '#c62828',
      },
    },
    {
      key: 'bagCount',
      header: 'שקים',
      type: 'number',
      width: '80px',
      align: 'center',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'contactName',
      header: 'איש קשר',
      type: 'text',
      width: '150px',
      align: 'right',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'contactPhone',
      header: 'טלפון',
      type: 'text',
      width: '130px',
      align: 'center',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'address',
      header: 'כתובת',
      type: 'text',
      width: '180px',
      align: 'right',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'hubName',
      header: 'מוקד מרכז',
      type: 'text',
      width: '140px',
      align: 'right',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'actions',
      header: 'פעולות',
      type: 'action',
      width: '100px',
      align: 'center',
      sortable: false,
      mobileVisible: true,
    },
  ],

  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 20, 50],
    showPageInfo: true,
  },

  features: {
    enableEdit: true,
    enableDelete: false,
    enableExport: true,
    enableSearch: true,
    enableFilters: true,
    enableSort: true,
  },

  styling: {
    statusColors: {
      ready: '#2196F3',
      inProgress: '#FFC107',
      completed: '#4CAF50',
      urgent: '#F44336',
    },
  },

  badges: [
    {
      label: 'סה"כ',
      field: 'status',
      filterValue: null,
      cssClass: 'badge-total',
    },
    {
      label: 'מוכן',
      field: 'status',
      filterValue: 'ready',
      color: '#2196F3',
      cssClass: 'badge-ready',
    },
    {
      label: 'בתהליך',
      field: 'status',
      filterValue: 'inProgress',
      color: '#FFC107',
      cssClass: 'badge-progress',
    },
    {
      label: 'הושלם',
      field: 'status',
      filterValue: 'completed',
      color: '#4CAF50',
      cssClass: 'badge-completed',
    },
  ],
};
