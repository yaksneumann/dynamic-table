# 📊 רכיב טבלה דינמי (Smart Table Component)

[English](README.md) | עברית

**רכיב טבלה גנרי לחלוטין שעובד עם כל סוג של נתונים.** הגדר פעם אחת, השתמש בכל מקום - מרשימת עובדים ועד דוחות כספיים.

## 🎯 למה "דינמי"?

בניגוד לטבלאות קבועות שקשורות למודל נתונים ספציפי, הרכיב הזה מתאים את עצמו **למבנה הנתונים שלך**:

- ✅ **אין עמודות קבועות בקוד** - מוגדרות דרך קונפיגורציה
- ✅ **עובד עם כל ישות** - עובדים, מתקנים, מוצרים, הזמנות, כל דבר
- ✅ **החלפה מיידית** - אותו רכיב, קונפיגורציות שונות
- ✅ **Type-safe מלא** - תמיכה מלאה ב-TypeScript עם Generics

**רכיב אחד. אינסוף שימושים.**

## ✨ תכונות

### 🔍 חיפוש מתקדם
- חיפוש טקסט מלא בכל הנתונים
- בחירת עמודות ספציפיות לחיפוש
- מצב חיפוש: "כל העמודות" או "אחת מהעמודות"
- חיפוש בשדות מקוננים

### 🎨 סינון וחיפוש
- פילטרים מתקדמים עם 14 אופרטורים שונים
- תמיכה בלוגיקה מורכבת (AND/OR)
- פילטרים מקוננים לשאילתות מורכבות
- סינון לפי טווח (between), מכיל, מתחיל ב-, ועוד

### 📅 בורר תאריכים מודרני
- **Material Design** - עיצוב מודרני ונקי
- **התאמה אישית של צבעים** - התאם לעיצוב שלך
- תצוגת לוח שנה נוחה
- תמיכה מלאה ב-RTL
- גובה מינימלי לשילוב בשורות הטבלה

### 📊 ניהול נתונים
- **Client-side mode** - כל הנתונים מטופלים בדפדפן
- **Server-side mode** - נתונים נטענים מהשרת לפי דרישה
- תמיכה ב-Observable, Promise, ו-Array
- Virtual scrolling לטבלאות ענק (אלפי שורות)

### ✏️ עריכה
- **Inline editing** - עריכה ישירה בתא
- **Expanded editing** - טופס מתחת לשורה
- **Modal editing** - טופס בחלון קופץ
- תמיכה ב-CRUD מלא

### 📱 רספונסיבי מלא
- מעבר אוטומטי לתצוגת כרטיסים במובייל (< 768px)
- Infinite scroll במובייל
- קונפיגורציה נפרדת לנראות במובייל לכל עמודה

### 🎯 תכונות נוספות
- בחירת שורות (single/multiple)
- גרירה וסידור מחדש של שורות
- גרירה וסידור מחדש של עמודות
- ייצוא לCSV, Excel והדפסה
- תגיות ספירה אוטומטיות לסטטוסים
- עיצוב תנאי לתאים (ע"פ לוגיקה עסקית)
- שמירת מצב (URL/LocalStorage)
- פאנל דיאגנוסטיקה לביצועים
- תבניות מותאמות (Templates) לכותרות, תאים ופעולות
- ⚡ Angular 21 Signals למצב ריאקטיבי
- 🌐 תמיכה מלאה ב-RTL (עברית)

## 🚀 התחלה מהירה

```bash
npm install
ng s -o
# פתח http://localhost:4200
```

## 📖 איך להשתמש (2 שלבים פשוטים)

### שלב 1: הגדר קונפיגורציה לטבלה

ספר לטבלה אילו עמודות להציג ואיך לעצב אותן לדוגמה:

```typescript
export const productTableConfig: TableConfig = {
  // אופן ניהול הנתונים
  dataMode: 'client', // או 'server' לטעינה מהשרת
  editMode: 'modal',  // או 'inline' / 'expanded'
  
  columns: [
    {
      key: 'name',
      header: 'שם מוצר',
      type: 'text',
      mobileVisible: true, // יוצג במובייל
      sortable: true,      // ניתן למיין
      hideable: true,      // ניתן להסתיר
      draggable: true      // ניתן לגרור
    },
    {
      key: 'price',
      header: 'מחיר',
      type: 'currency',
      format: (value) => `₪${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => value > 1000,  // הדגשת מוצרים יקרים
        backgroundColor: '#fff3e0',
        textColor: '#e65100'
      }
    },
    {
      key: 'status',
      header: 'סטטוס',
      type: 'badge',
      mobileVisible: true
    }
  ],
  
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showPageInfo: true
  },
  
  // Virtual scrolling לביצועים
  virtualization: {
    enabled: true,
    itemSize: 52,              // גובה שורה
    mobileItemSize: 160,       // גובה כרטיס במובייל
    maxViewportHeight: 520     // גובה מקסימלי
  },
  
  features: {
    enableSearch: true,               // חיפוש
    enableEdit: true,                 // עריכה
    enableDelete: true,               // מחיקה
    enableSort: true,                 // מיון
    enableFilters: true,              // פילטרים מתקדמים
    enableSelection: true,            // בחירת שורות
    enableRowReorder: true,           // סידור מחדש של שורות
    enableMobileInfiniteScroll: true, // גלילה אינסופית במובייל
    showTotalCount: true              // הצג ספירה כוללת
  },
  
  // בחירת שורות
  selection: {
    mode: 'multiple', // או 'single'
    trackBy: (row) => row.id
  },
  
  // ייצוא נתונים
  exports: {
    enableCsv: true,
    enableExcel: true,
    enablePrint: true,
    fileName: 'products-export'
  },
  
  // שמירת מצב
  statePersistence: 'storage', // או 'url' / 'none'
  stateKey: 'products-table',
  
  // דיאגנוסטיקה
  diagnostics: {
    enabled: true
  },
  
  // עיצוב
  styling: {
    statusColors: {
      'active': '#4caf50',
      'inactive': '#f44336'
    }
  },
  
  // הגדרות חיפוש
  searchConfig: {
    mode: 'any', // או 'all'
    columns: ['name', 'description'] // עמודות מסוימות
  }
};
```

### שלב 2: השתמש ברכיב

#### שימוש בסיסי (Client-side)

```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <app-smart-table 
      [config]="productConfig" 
      [clientData]="productData"
      (rowClick)="onRowClick($event)"
      (actionClick)="onAction($event)"
      (selectionChange)="onSelectionChange($event)"
    />
  `
})
export class ProductsComponent {
  productData: Product[] = [
    { id: '1', name: 'לפטופ', price: 4500, status: 'available' },
    { id: '2', name: 'עכבר', price: 89, status: 'available' }
  ];
  
  productConfig = productTableConfig;
  
  onRowClick(row: Product) {
    console.log('Row clicked:', row);
  }
  
  onAction(event: { row: Product; action: 'edit' | 'delete' }) {
    if (event.action === 'edit') {
      // טפל בעריכה
    } else if (event.action === 'delete') {
      // טפל במחיקה
    }
  }
  
  onSelectionChange(selectedIds: string[]) {
    console.log('Selected IDs:', selectedIds);
  }
}
```

#### שימוש מתקדם (Server-side)

```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <app-smart-table 
      [config]="productConfig" 
      [serverDataSource]="dataSource"
    />
  `
})
export class ProductsComponent {
  productConfig: TableConfig<Product> = {
    ...productTableConfig,
    dataMode: 'server' // חשוב!
  };
  
  dataSource: TableDataSource<Product> = {
    load: (params: TableQueryParams<Product>) => {
      // params מכיל: page, pageSize, sort, filters, searchTerm
      return this.http.get<TableDataSourceResult<Product>>('/api/products', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.searchTerm,
          sort: params.sort?.key || '',
          direction: params.sort?.direction || ''
        }
      });
    }
  };
}
```

**זהו!** הטבלה מציגה את הנתונים שלך עם חיפוש, pagination, פילטרים מתקדמים ועיצוב רספונסיבי.

## 🔧 שימוש חוזר בכל מקום

**אותו רכיב, נתונים שונים:**

```typescript
// טבלת עובדים
<app-smart-table [config]="employeeConfig" [clientData]="employeeData" />

// טבלת מתקנים
<app-smart-table [config]="facilityConfig" [clientData]="facilityData" />

// טבלת מוצרים עם שרת
<app-smart-table [config]="productConfig" [serverDataSource]="productDataSource" />
```

כל קונפיגורציה מגדירה עמודות, כללי עיצוב ותכונות שונות - אבל משתמשת ב**אותו רכיב בדיוק**.

## 📋 מדריך אינטגרציה מפורט

### שלב 1: העתק את קבצי הרכיב

העתק את התיקייה המלאה של הרכיב לפרויקט שלך:

```
מהפרויקט הזה:
src/app/components/smart-table/
  ├── smart-table.component.ts
  ├── smart-table.html
  └── smart-table.css

אל הפרויקט שלך:
src/app/shared/components/smart-table/
  ├── smart-table.component.ts
  ├── smart-table.html
  └── smart-table.css
```

### שלב 2: העתק את קבצי המודלים

העתק את ממשקי ה-TypeScript הנדרשים:

```
מהפרויקט הזה:
src/app/models/
  ├── table.config.interface.ts
  ├── table-data.interface.ts
  └── status-types.ts

אל הפרויקט שלך:
src/app/shared/models/
  ├── table.config.interface.ts
  ├── table-data.interface.ts
  └── status-types.ts
```

**חשוב:** תקן את ה-imports בקובץ `smart-table.component.ts` להתאים למיקום החדש:

```typescript
// לפני (בפרויקט הדמו)
import { TableConfig } from '../../models/table.config.interface';

// אחרי (בפרויקט שלך - תלוי במיקום)
import { TableConfig } from '@shared/models/table.config.interface';

```

### שלב 3: (אופציונלי) העתק את שירות ה-CRUD

אם אתה רוצה תכונות עריכה ומחיקה:

```
מהפרויקט הזה:
src/app/services/table.service.ts

אל הפרויקט שלך:
src/app/shared/services/table.service.ts
```

**התאם את השירות לצרכים שלך:**

```typescript
@Injectable({
  providedIn: 'root',
})
export class TableService<T extends { id: string }> {
  constructor(private http: HttpClient) {}

  update(item: T): Observable<T> {
    // החלף עם הדאטה האמיתי שלך
    return this.http.put<T>(`/api/items/${item.id}`, item);
  }

  delete(id: string): Observable<void> {
    // החלף עם הדאטה האמיתי שלך
    return this.http.delete<void>(`/api/items/${id}`);
  }
}
```

### שלב 4: צור קונפיגורציה לנתונים שלך

צור קובץ קונפיג חדש שיהיה בהתאמה לפרוייקט שלך:

**דוגמה: קונפיגורציה לטבלת משתמשים**

```typescript
// src/app/configs/users-table.config.ts

import { TableConfig } from '@shared/models/table.config.interface';

export const usersTableConfig: TableConfig = {
  columns: [
    {
      key: 'id',
      header: 'מזהה משתמש',
      type: 'text',
      width: '100px',
      align: 'right',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'fullName',
      header: 'שם מלא',
      type: 'text',
      width: '200px',
      align: 'right',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'email',
      header: 'אימייל',
      type: 'text',
      width: '220px',
      align: 'left',
      sortable: true,
      mobileVisible: true,
    },
    {
      key: 'role',
      header: 'תפקיד',
      type: 'badge',
      width: '120px',
      align: 'center',
      mobileVisible: true,
      format: (value: string) => {
        const roleMap: Record<string, string> = {
          admin: 'מנהל מערכת',
          user: 'משתמש רגיל',
          guest: 'אורח',
        };
        return roleMap[value] || value;
      },
    },
    {
      key: 'registrationDate',
      header: 'תאריך הרשמה',
      type: 'date',
      width: '140px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'status',
      header: 'סטטוס',
      type: 'badge',
      width: '100px',
      align: 'center',
      mobileVisible: true,
      format: (value: string) => {
        const statusMap: Record<string, string> = {
          active: 'פעיל',
          inactive: 'לא פעיל',
          suspended: 'מושעה',
        };
        return statusMap[value] || value;
      },
      styleConfig: {
        condition: (value) => value === 'suspended',
        backgroundColor: '#ffebee',
        textColor: '#c62828',
      },
    },
  ],
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  features: {
    enableSearch: true,
    enableEdit: true,
    enableDelete: true,
  },
  styling: {
    statusColors: {
      active: '#4caf50',
      inactive: '#9e9e9e',
      suspended: '#f44336',
    },
  },
};
```

### שלב 5: הגדר את ממשק הנתונים שלך

צור interface לנתונים שלך:

```typescript
// src/app/models/user.interface.ts

export interface User {
  id: string;                    // חובה
  status?: string;               // אופציונלי, נדרש אם משתמש בתכונת status badges
  fullName: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  registrationDate: string;
  [key: string]: any;            // מאפשר שדות נוספים
}
```

**דרישות מינימום:**
- `id: string` - חובה
- `status?: string` - אופציונלי, נדרש רק אם משתמש בתכונת ספירת סטטוסים
- כל שדה אחר שמופיע ב-`columns` של הקונפיגורציה

### שלב 6: השתמש ברכיב בקומפוננטה שלך

```typescript
// src/app/pages/users/users.component.ts

import { Component, OnInit } from '@angular/core';
import { SmartTableComponent } from '@shared/components/smart-table/smart-table.component';
import { usersTableConfig } from '@app/configs/users-table.config';
import { User } from '@app/models/user.interface';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <div class="page-container">
      <h1>ניהול משתמשים</h1>
      <app-smart-table 
        [config]="tableConfig" 
        [data]="users"
      />
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
      direction: rtl;
    }
  `]
})
export class UsersComponent implements OnInit {
  tableConfig = usersTableConfig;
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe(users => {
      this.users = users;
    });
  }
}
```

## 📋 מדריך קונפיגורציה מפורט

### מאפייני עמודה (Column Properties)

```typescript
{
  key: string;                    // שם השדה בנתונים (חובה)
  header: string;                 // כותרת העמודה (חובה)
  type: 'text' | 'number' | 'badge' | 'currency' | 'date' | 'action';
  width?: string;                 // רוחב העמודה (למשל: '120px', '20%')
  align?: 'left' | 'center' | 'right';  // יישור תוכן
  sortable?: boolean;             // האם ניתן למיין לפי עמודה זו
  mobileVisible?: boolean;        // האם להציג במובייל
  hideable?: boolean;             // האם המשתמש יכול להסתיר/להציג
  hidden?: boolean;               // האם מוסתר בהתחלה
  draggable?: boolean;            // האם ניתן לגרור לסידור מחדש
  format?: (value: any, row?: any) => string;  // פונקציית עיצוב מותאמת
  styleConfig?: {                 // עיצוב תנאי
    condition: (value: any, row?: any) => boolean;  // תנאי להחלת העיצוב
    backgroundColor?: string;      // צבע רקע
    textColor?: string;            // צבע טקסט
    fontWeight?: string;           // עובי גופן
    borderRadius?: string;         // עיגול פינות
  }
}
```

### דגלי תכונות (Feature Flags)

```typescript
features: {
  enableSearch?: boolean;           // שורת חיפוש גלובלית
  enableEdit?: boolean;             // כפתור עריכה בכל שורה
  enableDelete?: boolean;           // כפתור מחיקה בכל שורה
  enableSort?: boolean;             // מיון בלחיצה על כותרות
  enableFilters?: boolean;          // פילטרים מתקדמים
  enableSelection?: boolean;        // בחירת שורות עם checkboxes
  enableRowReorder?: boolean;       // גרירה וסידור מחדש של שורות
  showTotalCount?: boolean;         // הצג ספירה כוללת
  enableMobileInfiniteScroll?: boolean; // גלילה אינסופית במובייל
}
```

### הגדרות Pagination

```typescript
pagination: {
  defaultPageSize: number;         // גודל עמוד ברירת מחדל
  pageSizeOptions: number[];       // אפשרויות גודל עמוד
  showPageInfo?: boolean;          // האם להציג מידע על העמוד (כגון "1-10 מתוך 50")
}
```

### Virtual Scrolling (לביצועים)

```typescript
virtualization?: {
  enabled?: boolean;                // האם להפעיל virtual scrolling
  itemSize: number;                 // גובה שורה בפיקסלים (desktop)
  mobileItemSize?: number;          // גובה כרטיס בפיקסלים (mobile)
  maxViewportHeight?: number;       // גובה מקסימלי של אזור הגלילה
}
```

### הגדרות בחירה (Selection)

```typescript
selection?: {
  mode?: 'single' | 'multiple';   // בחירה יחידה או מרובה
  trackBy?: (row: T) => string;    // פונקציה לזיהוי ייחודי של שורה
}
```

### הגדרות ייצוא (Export)

```typescript
exports?: {
  enableCsv?: boolean;              // אפשר ייצוא CSV
  enableExcel?: boolean;            // אפשר ייצוא Excel
  enablePrint?: boolean;            // אפשר הדפסה
  fileName?: string;                // שם קובץ ברירת מחדל
}
```

### שמירת מצב (State Persistence)

```typescript
statePersistence?: 'none' | 'url' | 'storage';  // איפה לשמור את מצב הטבלה
stateKey?: string;                  // מפתח ייחודי ל-localStorage
```

### הגדרות עיצוב

```typescript
styling?: {
  statusColors?: Record<string, string>;  // צבעים לכל סטטוס
  customClasses?: string[];               // מחלקות CSS מותאמות
}
```

### הגדרות חיפוש (Search Config)

```typescript
searchConfig?: {
  mode?: 'any' | 'all';            // 'any' = התאמה באחד מהשדות, 'all' = התאמה בכל השדות
  columns?: ColumnKey<T>[];        // עמודות ברירת מחדל לחיפוש
}
```

### אופרטורי פילטר מתקדמים

הטבלה תומכת ב-14 אופרטורים שונים:

```typescript
type FilterOperator =
  | 'eq'          // שווה ל-
  | 'neq'         // לא שווה ל-
  | 'contains'    // מכיל
  | 'startsWith'  // מתחיל ב-
  | 'endsWith'    // נגמר ב-
  | 'gt'          // גדול מ-
  | 'gte'         // גדול או שווה ל-
  | 'lt'          // קטן מ-
  | 'lte'         // קטן או שווה ל-
  | 'between'     // בין שני ערכים
  | 'in'          // נמצא ברשימה
  | 'notIn'       // לא נמצא ברשימה
  | 'isEmpty'     // ריק
  | 'isNotEmpty'; // לא ריק
```

## 💡 דוגמאות שימוש מתקדמות

### עיצוב תנאי מורכב

הדגש תאים לפי תנאי מורכב:

```typescript
styleConfig: {
  condition: (value, row) => {
    // הדגש אם הסכום גבוה והסטטוס דחוף
    return row.status === 'urgent' && value > 5000;
  },
  backgroundColor: '#ffebee',
  textColor: '#c62828',
  fontWeight: 'bold',
}
```

### פורמטר מותאם לתאריכים

```typescript
{
  key: 'createdAt',
  header: 'תאריך יצירה',
  type: 'date',
  format: (value) => {
    const date = new Date(value);
    const today = new Date();
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    
    return date.toLocaleDateString('he-IL');
  }
}
```

### פילטרים מתקדמים מותאמים אישית

```typescript
// שימוש ב-FilterGroup למבנה פילטרים מורכב
const advancedFilter: FilterGroup<Product> = {
  logic: 'and', // כל התנאים חייבים להתקיים
  conditions: [
    {
      field: 'price',
      operator: 'between',
      value: 100,
      valueTo: 1000
    },
    {
      field: 'status',
      operator: 'in',
      value: ['active', 'pending']
    },
    {
      field: 'name',
      operator: 'contains',
      value: 'laptop',
      caseSensitive: false
    }
  ]
};
```

### שימוש ב-Templates מותאמים אישית

```typescript
@Component({
  template: `
    <app-smart-table 
      [config]="config"
      [clientData]="data"
      [headerTemplate]="customHeader"
      [cellTemplate]="customCell"
      [actionTemplate]="customActions"
      [emptyTemplate]="emptyState"
      [mobileCardTemplate]="mobileCard"
    />
    
    <!-- Template מותאם לכותרת -->
    <ng-template #customHeader let-column>
      <div class="custom-header">
        <i class="icon">📊</i>
        {{ column.header }}
      </div>
    </ng-template>
    
    <!-- Template מותאם לתא -->
    <ng-template #customCell let-row let-column="column" let-value="value">
      <div class="custom-cell">
        @if (column.key === 'price') {
          <strong>₪{{ value | number }}</strong>
        } @else {
          {{ value }}
        }
      </div>
    </ng-template>
    
    <!-- Template מותאם לפעולות -->
    <ng-template #customActions let-row let-index="index">
      <button (click)="viewDetails(row)">👁️</button>
      <button (click)="duplicate(row)">📋</button>
      <button (click)="archive(row)">📦</button>
    </ng-template>
    
    <!-- Template למצב ריק -->
    <ng-template #emptyState>
      <div class="empty-illustration">
        <img src="assets/empty.svg" alt="No data" />
        <h3>אין נתונים</h3>
        <p>התחל על ידי הוספת פריט חדש</p>
        <button (click)="addNew()">הוסף חדש</button>
      </div>
    </ng-template>
    
    <!-- Template מותאם לכרטיס מובייל -->
    <ng-template #mobileCard let-row let-index="index">
      <div class="custom-mobile-card">
        <div class="card-badge" [style.background]="getStatusColor(row.status)">
          {{ row.status }}
        </div>
        <h3>{{ row.name }}</h3>
        <p>{{ row.description }}</p>
        <div class="card-footer">
          <span class="price">₪{{ row.price }}</span>
          <button (click)="viewRow(row)">צפה</button>
        </div>
      </div>
    </ng-template>
  `
})
```

### טעינה מהשרת עם פילטרים

```typescript
readonly dataSource: TableDataSource<Product> = {
  load: (params: TableQueryParams<Product>) => {
    // params.filters מכיל את כל הפילטרים המותקנים
    // params.sort מכיל את מצב המיון הנוכחי
    // params.searchTerm מכיל את מחרוזת החיפוש
    
    return this.http.post<TableDataSourceResult<Product>>('/api/products/search', {
      page: params.page,
      pageSize: params.pageSize,
      search: params.searchTerm,
      searchColumns: params.searchColumns,
      searchMode: params.searchMode,
      sort: params.sort,
      filters: params.filters
    }).pipe(
      map(response => ({
        items: response.items,
        total: response.total
      })),
      catchError(error => {
        console.error('Failed to load data', error);
        return of({ items: [], total: 0 });
      })
    );
  }
};
```

### שימוש עם Observables

```typescript
// הנתונים מגיעים מ-Store/Service
products$ = this.store.select(selectProducts);

// בתבנית
<app-smart-table 
  [config]="config" 
  [clientData]="(products$ | async) || []"
/>
```

### קונפיגורציות שונות לאותם נתונים

```typescript
// קונפיגורציה בסיסית
readonly basicConfig: TableConfig<Employee> = {
  ...employeeConfig,
  features: {
    enableSearch: true,
    enableSort: true
  }
};

// קונפיגורציה למנהל עם עריכה
readonly adminConfig: TableConfig<Employee> = {
  ...employeeConfig,
  editMode: 'modal',
  features: {
    enableSearch: true,
    enableSort: true,
    enableEdit: true,
    enableDelete: true,
    enableFilters: true
  }
};

// קונפיגורציה לתצוגה בלבד
readonly readOnlyConfig: TableConfig<Employee> = {
  ...employeeConfig,
  features: {
    enableSearch: true,
    enableSort: true
  },
  columns: employeeConfig.columns.filter(col => col.type !== 'action')
};
```

### עמודת פעולות מותאמת

```typescript
{
  key: 'actions',
  header: 'פעולות',
  type: 'action',
  width: '150px',
  align: 'center',
  mobileVisible: true,
}
```

הרכיב מציג אוטומטית כפתורי עריכה ומחיקה אם הם מופעלים ב-`features`.

## 🎨 התאמות CSS

אפשר לעצב את הטבלה דרך CSS:

```css
/* התאמות גלובליות */
app-smart-table {
  --table-border-color: #e0e0e0;
  --table-header-bg: #f5f5f5;
  --table-row-hover: #f9f9f9;
  --primary-color: #1976d2;
}

/* דרס סגנונות ספציפיים */
app-smart-table ::ng-deep .table-container {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

## 📱 חוויית משתמש במובייל

**Desktop (> 768px):** טבלה מלאה עם כל העמודות  
**Mobile (≤ 768px):** תצוגת כרטיסים עם רק עמודות שמסומנות `mobileVisible: true`

**טיפ:** שים `mobileVisible: true` רק לשדות הכי חשובים (3-4 שדות) לחוויה אופטימלית במובייל.

## 🔍 חיפוש וסינון

### חיפוש בסיסי

הרכיב מספק חיפוש אוטומטי בכל השדות:

```typescript
features: {
  enableSearch: true,  // מפעיל שדה חיפוש
}
```

**החיפוש עובד על:**
- כל השדות (strings, numbers)
- שדות מעוצבים (format functions)
- אובייקטים מקוננים (נעשה stringify)

### חיפוש מתקדם

הגדר עמודות ספציפיות לחיפוש:

```typescript
searchConfig: {
  mode: 'any',  // 'any' = מספיק התאמה באחד, 'all' = צריך התאמה בכולם
  columns: ['name', 'description', 'category']  // רק בעמודות אלו
}
```

המשתמש יכול גם לבחור עמודות דרך ה-UI!

### פילטרים מתקדמים

```typescript
features: {
  enableFilters: true  // מפעיל פאנל פילטרים מתקדם
}
```

הפאנל מאפשר:
- הוספה ומחיקה של תנאים
- בחירה מ-14 אופרטורים שונים
- לוגיקה AND/OR בין תנאים
- פילטרים מקוננים למבנים מורכבים

### דוגמה לפילטר מתוכנת

```typescript
// פילטר פשוט
const simpleFilter = {
  status: 'active',
  category: 'electronics'
};

// פילטר מורכב
const complexFilter: FilterGroup<Product> = {
  logic: 'or',
  conditions: [
    {
      field: 'price',
      operator: 'lt',
      value: 100
    },
    {
      field: 'discount',
      operator: 'gte',
      value: 50
    }
  ]
};
```

## ⚡ שיפורי ביצועים

### שימוש ב-Signals של Angular

הרכיב משתמש ב-Angular Signals למצב ריאקטיבי:

```typescript
// הנתונים מתעדכנים אוטומטית
users.set(newUsers);  // הטבלה תתעדכן מיידית
```

### Pagination חכם

רק השורות הנוכחיות מוצגות ב-DOM:

```typescript
pagination: {
  defaultPageSize: 20,  // רק 20 שורות ב-DOM בכל פעם
}
```

## 🛠️ פתרון בעיות נפוצות

### הרכיב לא מוצא את ה-imports

```typescript
// ודא שה-paths ב-tsconfig.json מוגדר
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["src/app/shared/*"],
      "@app/*": ["src/app/*"]
    }
  }
}
```

### עיצוב RTL לא עובד

```css
/* ודא ש-direction: rtl מוגדר */
:host {
  direction: rtl;
}
```

### תכונת עריכה/מחיקה לא עובדת

1. ודא ש-`TableService` מיובא
2. ודא שהשירות מחזיר Observable
3. בדוק שה-features מופעלים בקונפיגורציה

### Virtual Scrolling לא עובד

1. ודא ש-`@angular/cdk/scrolling` מותקן
2. בדוק ש-`itemSize` מתאים לגובה השורה בפועל
3. ודא ש-`maxViewportHeight` מוגדר

### הנתונים לא מתעדכנים

עבור Server-side, ודא ש-`dataMode: 'server'` מוגדר:

```typescript
config: TableConfig<T> = {
  ...baseConfig,
  dataMode: 'server'  // חשוב!
};
```

## 📚 משאבים נוספים

- **דוגמאות עבודה:** ראה `src/app/configs/` לדוגמאות מלאות
- **ממשקים:** ראה `src/app/models/table.config.interface.ts` לכל האפשרויות
- **קוד המקור:** `src/app/components/smart-table/`

## 🎯 דרישות מערכת

- **Angular 21** ומעלה
- **TypeScript 5.0** ומעלה
- **RxJS 7.0** ומעלה
- **@angular/cdk** (לגרירה ו-Virtual Scrolling)

## 🎨 API של הרכיב

### Inputs

```typescript
@Input() config: TableConfig<T>              // קונפיגורציה (חובה)
@Input() clientData: T[] | null              // נתונים למצב client-side
@Input() serverDataSource: TableDataSource<T> | null  // מקור נתונים למצב server-side

// Templates מותאמים אישית
@Input() headerTemplate: TemplateRef         // תבנית מותאמת לכותרות
@Input() cellTemplate: TemplateRef           // תבנית מותאמת לתאים
@Input() actionTemplate: TemplateRef         // תבנית מותאמת לפעולות
@Input() emptyTemplate: TemplateRef          // תבנית למצב ריק
@Input() mobileCardTemplate: TemplateRef     // תבנית לכרטיסים במובייל
```

### Outputs

```typescript
@Output() rowClick: EventEmitter<T>          // לחיצה על שורה
@Output() cellClick: EventEmitter<{          // לחיצה על תא
  row: T;
  column: ColumnConfig<T>;
  value: unknown;
}>
@Output() actionClick: EventEmitter<{        // לחיצה על פעולה
  row: T;
  action: 'edit' | 'delete';
}>
@Output() selectionChange: EventEmitter<string[]>  // שינוי בבחירה
@Output() rowReorder: EventEmitter<{         // סידור מחדש של שורות
  previousIndex: number;
  currentIndex: number;
  items: T[];
}>
```

## 📊 ביצועים

### Virtual Scrolling

עבור טבלאות עם אלפי שורות, השתמש ב-virtual scrolling:

```typescript
virtualization: {
  enabled: true,
  itemSize: 52,              // גובה קבוע לכל שורה
  mobileItemSize: 160,       // גובה כרטיס במובייל
  maxViewportHeight: 520     // גובה אזור הגלילה
}
```

**יתרונות:**
- רק שורות גלויות ב-DOM
- ביצועים מצוינים עם 10,000+ שורות
- צריכת זיכרון נמוכה

### Client-side vs Server-side

**Client-side** (`dataMode: 'client'`):
- ✅ מהיר למערכות קטנות (< 5,000 רשומות)
- ✅ חיפוש ומיון מיידי
- ✅ עובד offline
- ❌ טוען הכל מראש

**Server-side** (`dataMode: 'server'`):
- ✅ מתאים למערכות גדולות
- ✅ טוען רק מה שצריך
- ✅ משתמש במשאבי שרת
- ❌ דורש API מתאים

## 🎨 התאמות CSS

אפשר לעצב את הטבלה דרך CSS:

```css
/* התאמות גלובליות */
app-smart-table {
  --table-border-color: #e0e0e0;
  --table-header-bg: #f5f5f5;
  --table-row-hover: #f9f9f9;
  --primary-color: #1976d2;
}

/* דרס סגנונות ספציפיים */
app-smart-table ::ng-deep .table-container {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* עיצוב כרטיסים במובייל */
app-smart-table ::ng-deep .mobile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

## 🚀 שילוב בפרויקט שלך - מדריך מפורט

### דרישות מקדימות

```bash
Angular 20+ 
TypeScript 5.8+
Node.js 18+
```

### שלב 1: התקנת החבילות הנדרשות

```bash
# Angular Material - לבורר תאריכים מודרני
npm install @angular/material @angular/cdk

# אם צריך - Drag & Drop ו-Virtual Scrolling
npm install @angular/cdk
```

### שלב 2: העתקת הקבצים

העתק את הקבצים הבאים לפרויקט שלך:

```
src/app/
├── components/
│   ├── smart-table/              # הרכיב הראשי
│   │   ├── smart-table.component.ts
│   │   ├── smart-table.html
│   │   └── smart-table.css
│   └── date-picker/              # בורר תאריכים
│       ├── date-picker.component.ts
│       ├── date-picker.html
│       └── date-picker.css
├── models/                       # הגדרות טיפוסים
│   ├── table.config.interface.ts
│   ├── table-data.interface.ts
│   └── status-types.ts
└── services/
    └── table.service.ts          # שירות לניהול נתונים
```

### שלב 3: הגדרת app.config.ts

**חשוב!** הוסף את ה-providers הנדרשים עבור Angular Material:

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),      // נדרש ל-Material animations
    provideNativeDateAdapter()      // נדרש לבורר תאריכים
  ]
};
```

### שלב 4: הוסף Material Theme ל-styles.css

```css
/* בקובץ src/styles.css */
@import '@angular/material/prebuilt-themes/indigo-pink.css';

/* משתני צבע לבורר תאריכים */
:root {
  --dp-primary-color: #1976d2;
  --dp-secondary-color: #42a5f5;
  --dp-header-bg: #1976d2;
  --dp-header-text: #ffffff;
  --dp-today-color: #4caf50;
}

/* דריסות Material לבורר תאריכים */
.mat-calendar-header {
  background-color: var(--dp-header-bg, #1976d2) !important;
}

.mat-calendar-header .mat-calendar-period-button,
.mat-calendar-header .mat-calendar-previous-button,
.mat-calendar-header .mat-calendar-next-button {
  color: var(--dp-header-text, #ffffff) !important;
}

.mat-calendar-body-selected {
  background-color: var(--dp-primary-color, #1976d2) !important;
  color: #ffffff !important;
}

.mat-calendar-body-today:not(.mat-calendar-body-selected) {
  border-color: var(--dp-today-color, #4caf50) !important;
}

html, body { 
  height: 100%; 
  margin: 0; 
  font-family: Roboto, "Helvetica Neue", sans-serif; 
}
```

### שלב 5: צור קונפיגורציה לטבלה שלך

```typescript
// my-table.config.ts
import { TableConfig } from './models/table.config.interface';

export interface MyProduct {
  id: string;
  name: string;
  price: number;
  status: 'available' | 'sold' | 'pending';
  createdDate: string;
}

export const myProductConfig: TableConfig<MyProduct> = {
  dataMode: 'client',
  editMode: 'inline',
  
  columns: [
    {
      key: 'id',
      header: 'מזהה',
      type: 'text',
      sortable: true,
      mobileVisible: true
    },
    {
      key: 'name',
      header: 'שם מוצר',
      type: 'text',
      sortable: true,
      mobileVisible: true
    },
    {
      key: 'price',
      header: 'מחיר',
      type: 'currency',
      format: (value) => `₪${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => value > 1000,
        backgroundColor: '#e8f5e9',
        textColor: '#2e7d32'
      }
    },
    {
      key: 'status',
      header: 'סטטוס',
      type: 'badge',
      mobileVisible: true
    },
    {
      key: 'createdDate',
      header: 'תאריך יצירה',
      type: 'date',
      sortable: true
    },
    {
      key: 'actions',
      header: 'פעולות',
      type: 'action',
      mobileVisible: true
    }
  ],

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showPageInfo: true
  },

  features: {
    enableSearch: true,
    enableEdit: true,
    enableDelete: true,
    enableSort: true,
    enableFilters: true
  },

  // התאמת צבעים לבורר תאריכים
  styling: {
    statusColors: {
      available: '#4CAF50',
      sold: '#f44336',
      pending: '#FFC107'
    },
    datePickerColors: {
      primary: '#1976d2',
      secondary: '#42a5f5',
      headerBackground: '#1976d2',
      headerText: '#ffffff',
      todayColor: '#4caf50'
    }
  },

  statusTypes: ['available', 'sold', 'pending']
};
```

### שלב 6: השתמש ברכיב

```typescript
// my-component.ts
import { Component, signal } from '@angular/core';
import { SmartTableComponent } from './components/smart-table/smart-table.component';
import { myProductConfig, MyProduct } from './my-table.config';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <h1>ניהול מוצרים</h1>
    <app-smart-table 
      [config]="config" 
      [clientData]="products()"
      (actionClick)="handleAction($event)"
    />
  `
})
export class ProductsComponent {
  config = myProductConfig;
  
  products = signal<MyProduct[]>([
    { 
      id: '1', 
      name: 'מחשב נייד', 
      price: 3500, 
      status: 'available',
      createdDate: '2026-01-15'
    },
    { 
      id: '2', 
      name: 'עכבר', 
      price: 80, 
      status: 'sold',
      createdDate: '2026-01-20'
    }
  ]);

  handleAction(event: { row: MyProduct; action: 'edit' | 'delete' }) {
    if (event.action === 'edit') {
      console.log('עריכת מוצר:', event.row);
    } else if (event.action === 'delete') {
      console.log('מחיקת מוצר:', event.row);
    }
  }
}
```

### שלב 7: התאמת בורר התאריכים (אופציונלי)

אם רוצה להתאים את צבעי בורר התאריכים לפי משתמש, פשוט שנה את הקונפיגורציה:

```typescript
// צבעים כחולים (ברירת מחדל)
datePickerColors: {
  primary: '#1976d2',
  secondary: '#42a5f5',
  headerBackground: '#1976d2',
  headerText: '#ffffff',
  todayColor: '#4caf50'
}

// או צבעים אדומים
datePickerColors: {
  primary: '#e53935',
  secondary: '#ff5252',
  headerBackground: '#e53935',
  headerText: '#ffffff',
  todayColor: '#ff5252'
}

// או צבעים ירוקים
datePickerColors: {
  primary: '#4caf50',
  secondary: '#66bb6a',
  headerBackground: '#4caf50',
  headerText: '#ffffff',
  todayColor: '#ff9800'
}
```

### שימוש ב-Server-side Mode

אם יש לך מסד נתונים גדול ואתה רוצה לטעון נתונים מהשרת:

```typescript
import { Observable } from 'rxjs';
import { TableQueryParams, TableDataSourceResult } from './models/table.config.interface';

// בקונפיגורציה
dataMode: 'server',

// ברכיב
serverDataSource = signal<TableDataSource<MyProduct>>({
  load: (params: TableQueryParams<MyProduct>): Observable<TableDataSourceResult<MyProduct>> => {
    // שלח בקשה לשרת עם params
    return this.http.post<TableDataSourceResult<MyProduct>>('/api/products', params);
  }
});

// בטמפלייט
<app-smart-table 
  [config]="config" 
  [serverDataSource]="serverDataSource()"
/>
```

## 💡 טיפים חשובים

### 1. בורר תאריכים מודרני
- משתמש ב-Angular Material
- לא צריך `FormsModule` - הרכיב standalone
- מתאים אוטומטית לגובה השורה
- צבעים מותאמים אישית לכל טבלה

### 2. ללא Reactive Forms
הרכיב משתמש ב-`ngModel` פשוט לעריכה. זה מספיק כי:
- עריכה פשוטה של שדות בודדים
- אין צורך בולידציה מורכבת
- מבנה קל יותר
- **אם צריך ולידציה** - אפשר להוסיף `ReactiveFormsModule` בעצמך

### 3. Signals בלבד
- הפרויקט משתמש ב-Angular Signals בלבד
- אין RxJS מיותר (רק במקומות שבאמת צריך)
- מצב ריאקטיבי מודרני
- ביצועים מעולים

### 4. Standalone Components
- כל הרכיבים standalone (אין NgModule)
- ייבוא ישיר ברכיבים
- מבנה נקי יותר

## 🎓 דוגמאות שימוש נוספות

### טבלה עם Templates מותאמים

```typescript
@Component({
  template: `
    <app-smart-table 
      [config]="config" 
      [clientData]="data()"
      [cellTemplate]="customCell"
      [actionTemplate]="customActions"
    />
    
    <ng-template #customCell let-row let-column="column" let-value="value">
      @if (column.key === 'image') {
        <img [src]="value" alt="Product" style="width: 50px; height: 50px;">
      } @else {
        {{ value }}
      }
    </ng-template>
    
    <ng-template #customActions let-row>
      <button (click)="viewDetails(row)">📄 פרטים</button>
      <button (click)="duplicate(row)">📋 שכפל</button>
    </ng-template>
  `
})
```

### טבלה עם Virtual Scrolling

```typescript
export const largeDataConfig: TableConfig = {
  // ... columns ...
  
  virtualization: {
    enabled: true,
    itemSize: 52,              // גובה שורה בפיקסלים
    mobileItemSize: 160,       // גובה כרטיס במובייל
    maxViewportHeight: 600     // גובה מקסימלי לטבלה
  },
  
  features: {
    enableMobileInfiniteScroll: true  // במקום pagination במובייל
  }
};
```

## 🔧 פתרון בעיות נפוצות

### הלוח שנה לא נפתח
```typescript
// ודא שהוספת את ה-providers ב-app.config.ts:
provideAnimationsAsync(),
provideNativeDateAdapter()
```

### צבעי הלוח לא משתנים
```typescript
// ודא שהוספת את ה-Material theme ב-styles.css:
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// והוספת את הדריסות CSS
.mat-calendar-header {
  background-color: var(--dp-header-bg) !important;
}
```

### שגיאת קומפילציה
```typescript
// ודא שה-TypeScript עדכני:
npm install typescript@latest

// ודא שה-Angular עדכני:
npm install @angular/core@latest @angular/common@latest
```

## 📚 סיכום טכנולוגיות

הרכיב הזה הוא **פתרון גנרי לחלוטין** לתצוגת נתונים טבלאית. הוא לא קשור לסוג נתונים מסוים ויכול לעבוד עם כל ישות - עובדים, מתקנים, מוצרים, הזמנות, או כל דבר אחר.

**טכנולוגיות:**
- ✅ Angular 20+ עם Signals
- ✅ Angular Material Design
- ✅ Standalone Components (ללא NgModules)
- ✅ TypeScript Generics לבטיחות טיפוסים
- ✅ CDK Virtual Scrolling & Drag Drop
- ✅ Signal-based State Management
- ✅ Modern Control Flow (@if, @for)

**רוצה להציג משהו אחר?** פשוט:
1. צור interface לנתונים שלך עם `id: string`
2. כתוב config שמגדיר את העמודות
3. העבר config + data ל-`<app-smart-table>`

**רכיב אחד. נתונים שונים. זה כוח הטבלאות הדינמיות.**

---

**Angular 20+** • **מבוסס Signals** • **Material Design** • **Mobile-first** • **TypeScript** • **תמיכה RTL מלאה**
