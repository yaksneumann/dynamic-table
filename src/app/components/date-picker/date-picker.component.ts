import {
  Component,
  signal,
  computed,
  input,
  output,
  effect,
  ViewEncapsulation,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { DatePickerColors } from '../../models/table.config.interface';

/**
 * Modern date picker component with Material Design.
 * Features:
 * - Compact calendar popup
 * - Customizable colors matching table theme
 * - Responsive design
 * - Latest Angular signals API
 * - RTL support for Hebrew
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  encapsulation: ViewEncapsulation.None,
})
export class DatePickerComponent {
  private platformId = inject(PLATFORM_ID);

  /** Input value as ISO date string (YYYY-MM-DD) */
  value = input<string>('');

  /** Custom color configuration */
  colors = input<DatePickerColors | undefined>(undefined);

  /** Event emitted when date changes */
  dateChange = output<string>();

  /** Internal date object for Material datepicker */
  selectedDate = signal<Date | null>(null);

  /** Computed CSS custom properties for theming */
  customStyles = computed(() => {
    const colorConfig = this.colors();
    if (!colorConfig) return {};

    return {
      '--dp-primary-color': colorConfig.primary || '#e53935',
      '--dp-secondary-color': colorConfig.secondary || '#ff5252',
      '--dp-header-bg': colorConfig.headerBackground || '#e53935',
      '--dp-header-text': colorConfig.headerText || '#ffffff',
      '--dp-today-color': colorConfig.todayColor || '#ff5252',
    };
  });

  /** Formatted date string for display */
  private formattedDate = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  });

  constructor() {
    // Watch for external value changes
    effect(() => {
      const val = this.value();
      if (val) {
        this.parseDate(val);
      }
    });

    // Emit changes when date is updated
    effect(() => {
      const formatted = this.formattedDate();
      if (formatted) {
        this.dateChange.emit(formatted);
      }
    });

    // Apply custom color theme to document root for Material overlays
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const styles = this.customStyles();
        const root = document.documentElement;

        // Apply each CSS variable
        Object.entries(styles).forEach(([key, value]) => {
          if (value) {
            root.style.setProperty(key, value as string);
          }
        });
      }
    });
  }

  /**
   * Parse ISO date string to Date object
   */
  private parseDate(dateString: string): void {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        this.selectedDate.set(date);
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  }

  /**
   * Handle date selection from calendar
   */
  onDateChange(date: Date | null): void {
    this.selectedDate.set(date);
  }
}
