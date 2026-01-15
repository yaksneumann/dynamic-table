# 📊 Smart Table Component

A powerful, flexible, and modern data table component for Angular applications with built-in features like search, pagination, mobile responsiveness, and customizable styling.

## ✨ Features

- 🔍 **Full-text search** across all columns
- 📱 **Mobile responsive** with automatic card view on small screens
- 📄 **Pagination** with customizable page sizes
- 🎨 **Flexible styling** with conditional formatting
- 🎯 **Status badges** with automatic counting
- ✏️ **Inline editing** support
- 🔧 **Highly configurable** with minimal setup
- ⚡ **Signal-based reactivity** for optimal performance
- 🌐 **RTL support** built-in

## 🚀 Quick Start

### Installation

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/` to see the table in action.

### Basic Usage

1. **Create a data service** that implements `DataSourceService`:

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataSourceService } from '../models/table.config.interface';

@Injectable({
  providedIn: 'root'
})
export class MyDataService implements DataSourceService<MyDataType> {
  getData(): Observable<MyDataType[]> {
    return of([/* your data */]);
  }

  getById(id: string): Observable<MyDataType> {
    // implementation
  }

  update(item: MyDataType): Observable<MyDataType> {
    // implementation
  }

  delete?(id: string): Observable<void> {
    // optional delete implementation
  }
}
```

2. **Create a table configuration**:

```typescript
import { TableConfig } from '../models/table.config.interface';

export const myTableConfig: TableConfig = {
  columns: [
    {
      key: 'id',
      header: 'ID',
      type: 'text',
      width: '100px',
      align: 'left',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'name',
      header: 'Name',
      type: 'text',
      width: '200px',
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
      mobileVisible: true,
      format: (value: string) => {
        const statusMap = {
          ready: 'Ready',
          inProgress: 'In Progress',
          completed: 'Completed',
        };
        return statusMap[value] || value;
      }
    }
  ],
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showPageInfo: true,
  },
  features: {
    enableSearch: true,
    enableEdit: true,
    enableDelete: false,
    enableExport: false,
    enableFilters: false,
    enableSort: true,
  }
};
```

3. **Use the smart table in your component**:

```typescript
import { Component, inject } from '@angular/core';
import { SmartTableComponent } from './components/smart-table/smart-table.component';
import { MyDataService } from './services/my-data.service';
import { myTableConfig } from './configs/my-table.config';

@Component({
  selector: 'app-my-table',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <app-smart-table 
      [config]="config" 
      [dataSource]="dataService"
    />
  `
})
export class MyTableComponent {
  dataService = inject(MyDataService);
  config = myTableConfig;
}
```

## 📋 Configuration Options

### Column Configuration

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Property name in your data object |
| `header` | `string` | Display name for the column |
| `type` | `'text' \| 'number' \| 'badge' \| 'currency' \| 'date' \| 'action'` | Column data type |
| `width` | `string` | CSS width value (e.g., '120px') |
| `align` | `'left' \| 'center' \| 'right'` | Text alignment |
| `sortable` | `boolean` | Enable sorting for this column |
| `mobileVisible` | `boolean` | Show column on mobile devices |
| `format` | `(value: any, row?: any) => string` | Custom formatter function |
| `styleConfig` | `ColumnStyleConfig` | Conditional styling rules |

### Column Style Configuration

Apply conditional styling to cells based on their values:

```typescript
styleConfig: {
  condition: (value, row) => value > 100000,
  backgroundColor: '#ffebee',
  textColor: '#c62828',
  fontWeight: 'bold',
  borderRadius: '4px'
}
```

### Feature Flags

| Feature | Description |
|---------|-------------|
| `enableSearch` | Global search across all data |
| `enableEdit` | Allow inline editing of rows |
| `enableDelete` | Show delete buttons |
| `enableExport` | Export data functionality |
| `enableFilters` | Advanced filtering options |
| `enableSort` | Column sorting |

### Pagination Settings

```typescript
pagination: {
  defaultPageSize: 10,        // Initial rows per page
  pageSizeOptions: [5, 10, 20, 50], // Available page size options
  showPageInfo: true          // Show "Page X of Y" info
}
```

## 🎨 Advanced Features

### Custom Cell Formatting

Format cell values before display:

```typescript
{
  key: 'totalAmount',
  header: 'Total',
  type: 'currency',
  format: (value: number) => `$${value.toLocaleString('en-US')}`
}
```

### Status Badges with Auto-counting

The smart table automatically counts and displays status summaries:

```typescript
// Your data just needs a 'status' property
interface MyData {
  id: string;
  status: 'ready' | 'inProgress' | 'completed';
  // ... other properties
}
```

The component automatically displays badge counters for:
- Total items
- Ready status
- In Progress status
- Completed status

### Mobile Responsiveness

The table automatically switches to card view on screens < 768px. Control which columns appear on mobile with `mobileVisible`:

```typescript
{
  key: 'phoneNumber',
  header: 'Phone',
  type: 'text',
  mobileVisible: false  // Hide on mobile
}
```

### Data Service Interface

Your data service must implement:

```typescript
interface DataSourceService<T> {
  getData(): Observable<T[]>;           // Required: Fetch all data
  getById(id: string): Observable<T>;   // Required: Fetch single item
  update(item: T): Observable<T>;       // Required: Update item
  delete?(id: string): Observable<void>; // Optional: Delete item
}
```

## 💡 Examples

Check out the example implementation in:
- [FacilityTableComponent](src/app/components/facility-table/facility-table.component.ts)
- [Facility Table Config](src/app/configs/tables/facility-table.config.ts)
- [Facility Data Service](src/app/services/data-sources/facility-data.service.ts)

## 🛠️ Development

### Development Server

```bash
ng serve
```

### Building

```bash
ng build
```

### Running Tests

```bash
ng test
```

## 📦 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── smart-table/          # The smart table component
│   │   └── facility-table/       # Example implementation
│   ├── configs/
│   │   └── tables/               # Table configurations
│   ├── models/
│   │   ├── table.config.interface.ts  # Type definitions
│   │   └── table-data.interface.ts
│   └── services/
│       └── data-sources/         # Data service implementations
```

## 🎯 Data Model Requirements

Your data type must have an `id` property and can optionally include a `status` property:

```typescript
interface MyDataType {
  id: string;           // Required: Unique identifier
  status?: string;      // Optional: For status badges
  [key: string]: any;   // Your custom properties
}
```

## 🌐 RTL Support

The smart table has built-in RTL (Right-to-Left) support. The current implementation is configured for Hebrew, but you can easily modify it for your language needs in the template file.

## 📝 License

This project is part of the Dynamic Table application.

## 🤝 Contributing

Feel free to extend and customize the smart table component for your specific needs!

---

**Built with Angular 20.1** • **Powered by Signals** • **Mobile First**
