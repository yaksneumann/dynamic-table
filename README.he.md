# 📊 רכיב טבלה דינמי (Smart Table Component)

English | [עברית](README.he.md)

**רכיב טבלה גנרי לחלוטין שעובד עם כל סוג של נתונים.** הגדר פעם אחת, השתמש בכל מקום - מרשימת עובדים ועד דוחות כספיים.

## 🎯 למה "דינמי"?

בניגוד לטבלאות קבועות שקשורות למודל נתונים ספציפי, הרכיב הזה מתאים את עצמו **למבנה הנתונים שלך**:

- ✅ **אין עמודות קבועות בקוד** - מוגדרות דרך קונפיגורציה
- ✅ **עובד עם כל ישות** - עובדים, מתקנים, מוצרים, הזמנות, כל דבר
- ✅ **החלפה מיידית** - אותו רכיב, קונפיגורציות שונות
- ✅ **Type-safe מלא** - תמיכה מלאה ב-TypeScript עם Generics

**רכיב אחד. אינסוף שימושים.**

## ✨ תכונות

- 🔍 חיפוש טקסט מלא בכל הנתונים
- 📱 מעבר אוטומטי לתצוגת כרטיסים במובייל (< 768px)
- 📄 Pagination עם אפשרויות מידה מותאמות
- 🎨 עיצוב תנאי לתאים (ע"פ לוגיקה עסקית)
- 🎯 תגיות ספירה אוטומטיות לסטטוסים
- ✏️ תמיכה בעריכה inline
- ⚡ Angular Signals למצב ריאקטיבי
- 🌐 תמיכה מלאה ב-RTL (עברית/ערבית)

## 🚀 התחלה מהירה

```bash
npm install
ng serve
# פתח http://localhost:4200
```

## 📖 איך להשתמש (2 שלבים פשוטים)

### שלב 1: הגדר קונפיגורציה לטבלה

ספר לטבלה אילו עמודות להציג ואיך לעצב אותן:

```typescript
export const productTableConfig: TableConfig = {
  columns: [
    {
      key: 'name',
      header: 'שם מוצר',
      type: 'text',
      mobileVisible: true,
      sortable: true
    },
    {
      key: 'price',
      header: 'מחיר',
      type: 'currency',
      format: (value) => `₪${value.toLocaleString('he-IL')}`,
      styleConfig: {
        condition: (value) => value > 1000,  // הדגש מוצרים יקרים
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
    pageSizeOptions: [5, 10, 20, 50]
  },
  features: {
    enableSearch: true,
    enableEdit: true,
    enableDelete: true
  }
};
```

### שלב 2: השתמש ברכיב

```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SmartTableComponent],
  template: `
    <app-smart-table 
      [config]="productConfig" 
      [data]="productData"
    />
  `
})
export class ProductsComponent {
  productData: Product[] = [
    { id: '1', name: 'לפטופ', price: 4500, status: 'available' },
    { id: '2', name: 'עכבר', price: 89, status: 'available' }
  ];
  productConfig = productTableConfig;
}
```

**זהו!** הטבלה מציגה את הנתונים שלך עם חיפוש, pagination ועיצוב רספונסיבי.

## 🔧 שימוש חוזר בכל מקום

**אותו רכיב, נתונים שונים:**

```typescript
// טבלת עובדים
<app-smart-table [config]="employeeConfig" [data]="employeeData" />

// טבלת מתקנים
<app-smart-table [config]="facilityConfig" [data]="facilityData" />

// טבלת מוצרים
<app-smart-table [config]="productConfig" [data]="productData" />
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
// או
import { TableConfig } from '../../../models/table.config.interface';
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
    // החלף עם ה-API האמיתי שלך
    return this.http.put<T>(`/api/items/${item.id}`, item);
  }

  delete(id: string): Observable<void> {
    // החלף עם ה-API האמיתי שלך
    return this.http.delete<void>(`/api/items/${id}`);
  }
}
```

### שלב 4: צור קונפיגורציה לנתונים שלך

צור קובץ config חדש לישות שלך:

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
  enableSearch?: boolean;    // שורת חיפוש גלובלית
  enableEdit?: boolean;      // כפתור עריכה בכל שורה
  enableDelete?: boolean;    // כפתור מחיקה בכל שורה
  enableSort?: boolean;      // מיון בלחיצה על כותרות
  enableFilters?: boolean;   // (בפיתוח) פילטרים מתקדמים
}
```

### הגדרות Pagination

```typescript
pagination: {
  defaultPageSize: number;         // גודל עמוד ברירת מחדל
  pageSizeOptions: number[];       // אפשרויות גודל עמוד
  showPageInfo?: boolean;          // האם להציג מידע על העמוד
}
```

### הגדרות עיצוב

```typescript
styling?: {
  statusColors?: Record<string, string>;  // צבעים לכל סטטוס
  customClasses?: string[];               // מחלקות CSS מותאמות
}
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

## 📚 משאבים נוספים

- **דוגמאות עבודה:** ראה `src/app/configs/` לדוגמאות מלאות
- **ממשקים:** ראה `src/app/models/table.config.interface.ts` לכל האפשרויות
- **קוד המקור:** `src/app/components/smart-table/`

## 🎯 דרישות מערכת

- Angular 18 ומעלה
- TypeScript 5.0 ומעלה
- RxJS 7.0 ומעלה

## 📝 סיכום

הרכיב הזה הוא **פתרון גנרי לחלוטין** לתצוגת נתונים טבלאית. הוא לא קשור לסוג נתונים מסוים ויכול לעבוד עם כל ישות - עובדים, מתקנים, מוצרים, הזמנות, או כל דבר אחר.

**רוצה להציג משהו אחר?** פשוט:
1. צור interface לנתונים שלך
2. כתוב config שמגדיר את העמודות
3. העבר config + data ל-`<app-smart-table>`

**רכיב אחד. נתונים שונים. זה כוח הטבלאות הדינמיות.**

---

**Angular 18+** • **מבוסס Signals** • **Mobile-first** • **TypeScript** • **תמיכה RTL מלאה**
