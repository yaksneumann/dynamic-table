# 🚀 Dynamic Table - Angular 21 Project

## 📋 Project Overview

An advanced **dynamic, responsive table application** built with **Angular 21** showcasing modern Angular features including:
- ✨ New control flow syntax (`@if`, `@for`, `@empty`)
- 🎯 Signals for reactive state management
- 📱 Responsive design (desktop table / mobile cards)
- 🎨 Server-controlled dynamic styling
- 📄 Pagination without scrolling
- ✏️ Inline editing with detail modal

Perfect for managing postal facility delivery tasks with real-time data and advanced UI features.

---

## 🎯 Key Features

### 1. **Dynamic Column Configuration**
The table is completely data-driven. The server defines:
- Which columns to show
- Column headers, widths, and alignment
- Custom formatting functions
- Conditional styling rules

```typescript
// Example: Server returns this configuration
{
  key: 'totalAmount',
  header: 'סכום כולל',
  type: 'currency',
  mobileVisible: true,
  styleConfig: {
    condition: (value) => value > 100000,  // Business rule from server
    backgroundColor: '#ffebee',
    textColor: '#c62828',
  }
}
```

### 2. **Server-Controlled Styling** 🎨
- Dynamic color coding based on business logic
- Red backgrounds for amounts > ₪100,000
- Badge colors for statuses (ready, urgent, completed)
- Fully configurable from the backend

### 3. **Responsive Design** 📱

**Desktop View (> 768px)**:
- Full table with all columns
- Sortable headers
- Hover effects
- Edit button per row

**Mobile View (≤ 768px)**:
- Card-based layout
- Shows only essential info (ID, name, amount, status)
- Tap card to open full details
- Optimized for touch

### 4. **Pagination** 📄
- Clean page controls (First, Previous, Next, Last)
- Configurable page sizes (5, 10, 20, 50)
- Shows current range (e.g., "1-5 of 8")
- No infinite scroll - better performance

### 5. **Detail Modal** ✏️
- View/Edit modes
- Shows all nested data:
  - Basic info
  - Shipping details
  - Barcodes table
  - Team members
- Responsive modal design

### 6. **Status Summary Badges**
Real-time counters at the top showing:
- Total items
- Ready
- In Progress  
- Completed

Matches the design from the provided image.

---

## 🏗️ Architecture

```
src/app/
├── components/
│   └── dynamic-table/
│       ├── dynamic-table.ts          # Component logic (signals & methods)
│       ├── dynamic-table.html        # Template (@if/@for syntax)
│       └── dynamic-table.css         # Responsive styles
├── models/
│   ├── table-data.interface.ts       # TypeScript interfaces
│   └── mock-data.ts                  # Sample data + column definitions
├── services/
│   └── data-table.service.ts         # Service (future API integration)
└── app.ts                            # Root component
```

### Component Structure

```typescript
@Component({
  selector: 'app-dynamic-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-table.html',
  styleUrl: './dynamic-table.css',
})
export class DynamicTable implements OnInit {
  // Signals (reactive state)
  allData = signal<FacilityData[]>([]);
  columns = signal<TableColumn[]>([]);
  pagination = signal<PaginationConfig>({...});
  
  // Computed values (auto-recalculate)
  paginatedData = computed(() => {...});
  totalPages = computed(() => {...});
  visibleColumns = computed(() => {...});
}
```

---

## 🎨 Design Examples

### Angular 21 Modern Syntax

```html
<!-- Control flow with @if/@else -->
@if (!isMobile()) {
  <table class="data-table">
    <!-- Desktop view -->
  </table>
} @else {
  <div class="cards-container">
    <!-- Mobile cards -->
  </div>
}

<!-- Iteration with @for and track -->
@for (row of paginatedData(); track row.id) {
  <tr>
    @for (column of visibleColumns(); track column.key) {
      <td>{{ getCellValue(column, row) }}</td>
    }
  </tr>
} @empty {
  <!-- No data state -->
  <div class="empty-state">אין נתונים להצגה</div>
}
```

### Signals & Computed Values

```typescript
// Reactive state with signals
allData = signal<FacilityData[]>([]);
pagination = signal<PaginationConfig>({
  currentPage: 1,
  pageSize: 5,
  totalItems: 0,
});

// Automatically recomputes when dependencies change
paginatedData = computed(() => {
  const data = this.allData();
  const { currentPage, pageSize } = this.pagination();
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
});
```

### Dynamic Styling

```html
<!-- Style applied based on server configuration -->
<span [style]="getCellStyle(column, row[column.key], row)">
  {{ getCellValue(column, row) }}
</span>
```

```typescript
getCellStyle(column: TableColumn, value: any, row: FacilityData): any {
  if (column.styleConfig?.condition?.(value, row)) {
    return {
      backgroundColor: column.styleConfig.backgroundColor,
      color: column.styleConfig.textColor,
      padding: '4px 8px',
      borderRadius: '4px',
    };
  }
  return {};
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Navigate to project directory
cd c:\Doar\dynamic-table

# Install dependencies
npm install

# Start development server
npm start
```

Then open [http://localhost:4200](http://localhost:4200)

---

## 💻 Usage Examples

### Adding a New Column

**1. Update the interface:**

```typescript
// models/table-data.interface.ts
export interface FacilityData {
  [key: string]: any;
  // ... existing fields
  priority: 'high' | 'medium' | 'low';  // New field
}
```

**2. Add to mock data:**

```typescript
// models/mock-data.ts
{
  id: 'TSK-001',
  // ... existing fields
  priority: 'high',  // Add data
}
```

**3. Configure the column:**

```typescript
// models/mock-data.ts - TABLE_COLUMNS array
{
  key: 'priority',
  header: 'עדיפות',
  type: 'badge',
  mobileVisible: true,
  styleConfig: {
    condition: (value) => value === 'high',
    backgroundColor: '#ffeb3b',
    textColor: '#f57c00',
  }
}
```

That's it! The table automatically renders the new column with styling.

### Changing Business Rules

Server can return different styling conditions:

```typescript
styleConfig: {
  condition: (value, row) => {
    // Complex server-defined logic
    return row.status === 'urgent' &&  value > 50000;
  },
  backgroundColor: '#fff3e0',
  textColor: '#f57c00',
}
```

### Custom Formatters

```typescript
{
  key: 'createdAt',
  header: 'תאריך יצירה',
  type: 'date',
  format: (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
```

---

## 📊 Data Structure

### Main Entity: `FacilityData`

```typescript
interface FacilityData {
  id: string;                   // Unique identifier
  facilityName: string;         // Facility name
  address: string;              // Address
  contactName: string;          // Contact person
  contactPhone: string;         // Phone number
  bagCount: number;             // Number of bags
  totalAmount: number;          // Total money amount
  status: 'ready' | 'inProgress' | 'completed' | 'urgent';
  hub: 'center' | 'north' | 'south';
  hubName: string;              // Hub display name
  deliveryType: 'delivery' | 'pickup';
  targetFacility: string;
  createdAt: string;            // ISO date string
  barcodes: Barcode[];          // Nested array
  team: Team;                   // Nested object
}
```

### Column Configuration

```typescript
interface TableColumn {
  key: string;                  // Property key
  header: string;               // Display name
  type: 'text' | 'number' | 'badge' | 'currency' | 'date' | 'action';
  width?: string;               // '150px' or '20%'
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  mobileVisible?: boolean;      // Show on mobile?
  format?: (value: any, row?: any) => string;
  styleConfig?: ColumnStyleConfig;
}
```

---

## 🎯 Responsive Breakpoints

| Screen Size | Behavior |
|-------------|----------|
| **> 768px** (Desktop) | Full table with all columns |
| **≤ 768px** (Mobile) | Card view with limited fields |
| **≤ 480px** (Small Mobile) | Compact badges and controls |

---

## 🎨 Color Scheme

| Status | Background | Usage |
|--------|-----------|-------|
| **Ready** | `#2196F3` (Blue) | Items ready for processing |
| **In Progress** | `#FFC107` (Amber) | Active tasks |
| **Completed** | `#4CAF50` (Green) | Finished tasks |
| **Urgent** | `#F44336` (Red) | High priority items |
| **High Amount** | `#ffebee` (Light Red) | Amounts > ₪100,000 |

---

## 🔧 Configuration

### Change Default Page Size

```typescript
// dynamic-table.ts
pagination = signal<PaginationConfig>({
  currentPage: 1,
  pageSize: 10,                         // Change this
  totalItems: 0,
  pageSizeOptions: [5, 10, 20, 50],    // Available options
});
```

### Adjust Mobile Breakpoint

```css
/* dynamic-table.css */
@media (max-width: 768px) {  /* Change this value */
  /* Mobile styles */
}
```

---

## 📱 Mobile Experience

**Card Layout**:
- Tap card → Opens full details
- Edit button at bottom
- Swipe-friendly
- Compact display

**Shown Fields**:
- ID (top-left)
- Status badge (top-right with color)
- Facility name
- Total amount (with dynamic styling)

---

## 🚀 Future Enhancements

Potential features to add:

1. **Sorting**: Click column headers to sort
2. **Filtering**: Filter by status, hub, date range
3. **Search**: Real-time search across all fields
4. **Export**: Download as Excel/CSV
5. **Bulk Actions**: Select multiple rows
6. **Real-time Updates**: WebSocket integration
7. **Virtualization**: For datasets > 10,000 rows
8. **Inline Editing**: Edit directly in cells
9. **Drag & Drop**: Reorder rows
10. **Column Customization**: User can show/hide columns

---

## 🔐 Security Notes

When integrating with a real API:

### Sanitize Server-Provided Styles

```typescript
styleConfig: {
  condition: this.sanitizeFunction(serverCondition),
  backgroundColor: this.sanitizeColor(serverColor),
}

private sanitizeColor(color: string): string {
  // Only allow hex colors
  return /^#[0-9A-F]{6}$/i.test(color) ? color : '#000000';
}
```

### Validate Data

```typescript
private validateFacilityData(data: any): FacilityData | null {
  if (!data.id || !data.facilityName) return null;
  if (typeof data.totalAmount !== 'number') return null;
  // ... more validation
  return data as FacilityData;
}
```

---

## 📚 Technology Stack

- **Angular 21**: Latest framework with signals
- **TypeScript**: Full type safety
- **RxJS**: Reactive programming (when needed)
- **Standalone Components**: No NgModules
- **CSS3**: Modern styling with flexbox/grid
- **HTML5**: Semantic markup

---

## 🎓 Learning Resources

- [Angular Signals](https://angular.dev/guide/signals)
- [Built-in Control Flow](https://angular.dev/guide/templates/control-flow)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Angular Forms](https://angular.dev/guide/forms)

---

## 🤝 Contributing

To extend the project:

1. Add interfaces to `models/table-data.interface.ts`
2. Update mock data in `models/mock-data.ts`
3. Modify component logic in `dynamic-table.ts`
4. Update template in `dynamic-table.html`
5. Add styles to `dynamic-table.css`

---

## 📄 License

This project is for demonstration purposes.

---

## 🎉 Features Showcase

### ✅ Implemented
- [x] Dynamic column configuration
- [x] Server-controlled styling
- [x] Responsive design (desktop/mobile)
- [x] Pagination
- [x] Detail modal with view/edit modes
- [x] Status summary badges
- [x] RTL support for Hebrew
- [x] Modern Angular 21 syntax
- [x] Signals & computed values
- [x] Nested data display (barcodes, team)
- [x] Custom formatters
- [x] Conditional styling

### 🚧 Future Work
- [ ] API integration
- [ ] Sorting functionality
- [ ] Advanced filtering
- [ ] Search feature
- [ ] Excel export
- [ ] Real-time updates

---

**Built with ❤️ using Angular 21**

For questions or issues, refer to the code comments or Angular documentation.
