import { TableConfig } from '../models/table.config.interface';

export const employeeTableConfig: TableConfig = {
  columns: [
    {
      key: 'id',
      header: 'Employee ID',
      type: 'text',
      width: '120px',
      align: 'left',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'fullName',
      header: 'Full Name',
      type: 'text',
      width: '180px',
      align: 'left',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      width: '120px',
      align: 'center',
      sortable: true,
      mobileVisible: true,
      format: (value: string) => {
        const statusMap: Record<string, string> = {
          active: 'Active',
          remote: 'Remote',
          onLeave: 'On Leave',
          inactive: 'Inactive',
        };
        return statusMap[value] || value;
      },
    },
    {
      key: 'department',
      header: 'Department',
      type: 'text',
      width: '140px',
      align: 'left',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'position',
      header: 'Position',
      type: 'text',
      width: '180px',
      align: 'left',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'salary',
      header: 'Salary',
      type: 'currency',
      width: '120px',
      align: 'right',
      sortable: true,
      mobileVisible: false,
      format: (value: number) => `₪ ${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => value > 25000,
        backgroundColor: '#e8f5e9',
        textColor: '#2e7d32',
      },
    },
    {
      key: 'email',
      header: 'Email',
      type: 'text',
      width: '220px',
      align: 'left',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'phone',
      header: 'Phone',
      type: 'text',
      width: '130px',
      align: 'center',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      type: 'date',
      width: '120px',
      align: 'center',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'action',
      width: '100px',
      align: 'center',
      sortable: false,
      mobileVisible: true,
    },
  ],

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showPageInfo: true,
  },

  features: {
    enableEdit: true,
    enableDelete: true,
    enableExport: true,
    enableSearch: true,
    enableFilters: true,
    enableSort: true,
  },

  styling: {
    statusColors: {
      active: '#4CAF50',
      remote: '#2196F3',
      onLeave: '#FFC107',
      inactive: '#9E9E9E',
    },
  },

  badges: [
    {
      label: 'Total',
      field: 'status',
      filterValue: null,
      cssClass: 'badge-total',
    },
    {
      label: 'Active',
      field: 'status',
      filterValue: 'active',
      color: '#4CAF50',
      cssClass: 'badge-active',
    },
    {
      label: 'Remote',
      field: 'status',
      filterValue: 'remote',
      color: '#2196F3',
      cssClass: 'badge-remote',
    },
    {
      label: 'On Leave',
      field: 'status',
      filterValue: 'onLeave',
      color: '#FFC107',
      cssClass: 'badge-leave',
    },
    {
      label: 'Inactive',
      field: 'status',
      filterValue: 'inactive',
      color: '#9E9E9E',
      cssClass: 'badge-inactive',
    },
  ],
};
