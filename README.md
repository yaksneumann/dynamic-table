# 📊 Smart Table Component

[עברית](README.he.md) | English

**A truly dynamic, reusable Angular table component that works with ANY data type.** Configure once, use everywhere - from employee lists to facility management to financial reports.

## 🎯 Why "Dynamic"?

Unlike fixed tables tied to specific data models, this component adapts to **your data structure**:

- ✅ **No hard-coded columns** - Define them via config
- ✅ **Works with any entity** - Employees, facilities, products, orders, anything
- ✅ **Drop-in replacement** - Same component, different configurations
- ✅ **Type-safe** - Full TypeScript support with generics

**One component. Infinite use cases.**

## ✨ Features

- 🔍 Full-text search across all data
- 📱 Auto-switches to cards on mobile (< 768px)
- 📄 Pagination with customizable page sizes
- 🎨 Conditional cell styling (server-controlled)
- 🎯 Auto-counting status badges
- ✏️ Inline editing support
- ⚡ Angular 21 Signals for reactive updates
- 🌐 RTL support (Hebrew/Arabic ready)

## 🚀 Quick Start

```bash
npm install
ng serve
# Open http://localhost:4200
```

## 📖 How to Use (2 Simple Steps)

### Step 1: Define Table Configuration

Tell the table what columns to show and how to style them:

```typescript
export const productTableConfig: TableConfig = {
  columns: [
    {
      key: 'name',
      header: 'Product Name',
      type: 'text',
      mobileVisible: true,
      sortable: true
    },
    {
      key: 'price',
      header: 'Price',
      type: 'currency',
      format: (value) => `$${value.toFixed(2)}`,
      styleConfig: {
        condition: (value) => value > 1000,  // Highlight expensive items
        backgroundColor: '#fff3e0',
        textColor: '#e65100'
      }
    },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      mobileVisible: true
    }
  ],
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50]
  },
  features: {
    enableSearch: true,
    enableEdit: true,
    enableSort: true
  }
};
```

### Step 2: Use in Your Component

```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <app-smart-table 
      [config]="facilityConfig" 
      [data]="facilityData"
    />
  `
})
export class ProductsComponent {
  productData: Product[] = [
    { id: '1', name: 'Laptop', price: 1200, status: 'available' },
    { id: '2', name: 'Mouse', price: 25, status: 'available' }
  ];
  facilityConfig = facilityTableConfig;
}
```

**That's it!** The component displays your data with search, pagination, and responsive design.

## � Use It Anywhere

// Facilities table  
<app-smart-table [config]="facilityConfig" [data]="facilityData" />

// Employees table
<app-smart-table [config]="employeeConfig" [data]="employeeData" />

```

Each config defines different columns, styling rules, and features - but uses the **exact same component**.

## 📋 Configuration Reference

### Column Properties

```typescript
{
  key: 'fieldName',           // Property in your data
  header: 'Display Name',     // Column header text
  type: 'text' | 'number' | 'badge' | 'currency' | 'date',
  mobileVisible: true,        // Show on mobile?
  sortable: true,             // Enable sorting?
  format: (value, row) => string,  // Custom formatter
  styleConfig: {              // Conditional styling
    condition: (value, row) => boolean,
    backgroundColor: '#color',
    textColor: '#color'
  }
}
```

### Feature Flags

```typescript
features: {
  enableSearch: true,    // Global search bar
  enableEdit: true,      // Edit button
  enableSort: true,      // Click headers to sort
  enableDelete: false,   // Delete functionality
}
```

### Pagination Options

```typescript
pagination: {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50]
}
```

## 💡 Real-World Examples

### E-commerce Product Catalog

```typescript
columns: [
  { key: 'sku', header: 'SKU', type: 'text', mobileVisible: true },
  { key: 'name', header: 'Product', type: 'text', mobileVisible: true },
  { 
    key: 'stock', 
    header: 'Stock', 
    type: 'number',
    styleConfig: {
      condition: (value) => value < 10,  // Low stock warning
      backgroundColor: '#ffebee',
      textColor: '#c62828'
    }
  },
  { 
    key: 'price', 
    header: 'Price', 
    type: 'currency',
    format: (value) => `$${value.toFixed(2)}`
  }
]
```

### CRM Contact Management

```typescript
columns: [
  { key: 'name', header: 'Contact Name', type: 'text', mobileVisible: true },
  { key: 'company', header: 'Company', type: 'text' },
  { key: 'email', header: 'Email', type: 'text', mobileVisible: true },
  { 
    key: 'lastContact', 
    header: 'Last Contact', 
    type: 'date',
    format: (value) => new Date(value).toLocaleDateString()
  },
  { 
    key: 'dealStatus', 
    header: 'Status', 
    type: 'badge', 
    mobileVisible: true 
  }
]
```

### Financial Transactions

```typescript
columns: [
  { key: 'transactionId', header: 'ID', type: 'text', mobileVisible: true },
  { 
    key: 'amount', 
    header: 'Amount', 
    type: 'currency',
    styleConfig: {
      condition: (value) => value > 10000,  // Flag large transactions
      backgroundColor: '#fff3e0',
      fontWeight: 'bold'
    }
  },
  { key: 'category', header: 'Category', type: 'badge' },
  { key: 'date', header: 'Date', type: 'date', mobileVisible: true }
]
```

## 🎨 Advanced Features

**Conditional Styling** - Highlight cells based on business logic:
```typescript
styleConfig: {
  condition: (value, row) => row.status === 'urgent' && value > 5000,
  backgroundColor: '#ffebee',
  textColor: '#c62828'
}
```

**Custom Formatters** - Transform values before display:
```typescript
format: (value, row) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
```

**Status Badges** - Auto-counting for any property named `status`:
```typescript
interface MyData {
  id: string;
  status: 'pending' | 'active' | 'completed'; 
}
```

## 📱 Mobile Experience

Desktop (> 768px): Full table with all columns  
Mobile (≤ 768px): Card view showing only `mobileVisible: true` columns

Control visibility per column:
```typescript
{ key: 'detailedDescription', header: 'Details', mobileVisible: false }
```

## � Project Structure

```
src/app/
├── components/
│   └── smart-table/                    # ← The reusable component
│       ├── smart-table.component.ts    # Main component logic
│       ├── smart-table.html            # Template
│       └── smart-table.css             # Styles
├── configs/                            # ← Table configurations
│   ├── employee-table.config.ts        # Employee table example
│   └── facility-table.config.ts        # Facility table example
├── models/                             # ← Type definitions
│   ├── table.config.interface.ts       # Config interfaces
│   ├── table-data.interface.ts         # Data interfaces
│   ├── status-types.ts                 # Status definitions
│   └── mock-data.ts                    # Sample data
└── services/
    └── table.service.ts                # CRUD operations service
```

## 🎯 Your Data Requirements

```typescript
interface YourDataType {
  id: string;          
  status?: string;     
  [key: string]: any;   
```s:
- **Configs**: 
  - [facility-table.config.ts](src/app/configs/facility-table.config.ts) - Hebrew RTL example
  - [employee-table.config.ts](src/app/configs/employee-table.config.ts) - English example
- **Data**: [mock-data.ts](src/app/models/mock-data.ts) - Sample data
- **Usage**: [app.ts](src/app/app.ts) - Main app using both tables
See the working example:
- **Config**: [facility-table.config.ts](src/app/configs/facility-table.config.ts)
- **Service**: [facility-data.service.ts](src/app/services/data-sources/facility-data.service.ts)
- **Component**: Uses SmartTableComponent with above config

## 🛠️ Development

```bash
ng serve       # Development server
ng build       # Production build
ng test        # Run tests
```

## 📝 Summary

**This is NOT a facilities-specific or employees-specific table.** It's a generic, configurable table component that works with any data type.

**Want to display something else?** Just:
1. Define your data interface with `id: string` and optional `status` field
2. Create a config file defining your columns and features
3. Pass config and data to `<app-smart-table>`

Same component. Different data. That's the power of dynamic tables.

## 🚀 Integration into Your Project

Want to use this table in your own Angular project? See [README.he.md](README.he.md) for detailed integration instructions.

---

**Angular 18+** • **Signal-based** • **Mobile-first** • **TypeScript** • **RTL Support**
