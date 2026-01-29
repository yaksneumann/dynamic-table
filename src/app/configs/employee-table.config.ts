import { TableConfig } from '../models/table.config.interface';
import { EmployeeData } from '../models/table-data.interface';

export const employeeTableConfig: TableConfig<EmployeeData> = {
  dataMode: 'server',
  editMode: 'inline',
  columns: [
    {
      key: 'id',
      header: 'Employee ID',
      type: 'text',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'fullName',
      header: 'Full Name',
      type: 'text',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'email',
      header: 'Email',
      type: 'text',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'phone',
      header: 'Phone',
      type: 'text',
      sortable: false,
      mobileVisible: false,
    },
    {
      key: 'department',
      header: 'Department',
      type: 'text',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'position',
      header: 'Position',
      type: 'text',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'salary',
      header: 'Salary',
      type: 'currency',
      sortable: true,
      mobileVisible: false,
      format: (value: number) => `₪ ${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => typeof value === 'number' && value > 25000,
        backgroundColor: '#e8f5e9',
        textColor: '#2e7d32',
      },
    },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      type: 'date',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'birthDate',
      header: 'Birth Date',
      type: 'date',
      sortable: true,
      mobileVisible: false,
    },
    {
      key: 'actions',
      header: 'Actions',
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
    enableDelete: true,
    enableSearch: true,
    showTotalCount: false,
    enableFilters: true,
    enableSort: true,
    enableSelection: true,
  },

  styling: {
    statusColors: {
      active: '#4CAF50',
      remote: '#2196F3',
      onLeave: '#FFC107',
      inactive: '#9E9E9E',
    },
    datePickerColors: {
      primary: '#1976d2', // Blue for testing
      secondary: '#42a5f5', // Light blue for testing
      headerBackground: '#1976d2', // Blue header
      headerText: '#ffffff',
      todayColor: '#4caf50', // Green for today's date
    },
  },

  statusTypes: ['active', 'remote', 'onLeave', 'inactive'],
};
