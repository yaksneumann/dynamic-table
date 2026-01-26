import {
  Component,
  signal,
  computed,
  input,
  output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePickerComponent {
  value = input<string>('');
  dateChange = output<string>();

  selectedDay = signal<number>(1);
  selectedMonth = signal<number>(1);
  selectedYear = signal<number>(new Date().getFullYear());

  months = computed(() => [
    { value: 1, label: 'ינואר' },
    { value: 2, label: 'פברואר' },
    { value: 3, label: 'מרץ' },
    { value: 4, label: 'אפריל' },
    { value: 5, label: 'מאי' },
    { value: 6, label: 'יוני' },
    { value: 7, label: 'יולי' },
    { value: 8, label: 'אוגוסט' },
    { value: 9, label: 'ספטמבר' },
    { value: 10, label: 'אוקטובר' },
    { value: 11, label: 'נובמבר' },
    { value: 12, label: 'דצמבר' },
  ]);

  yearOptions = computed(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 100; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  });

  dayOptions = computed(() => {
    const month = this.selectedMonth();
    const year = this.selectedYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: number[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  });

  private formattedDate = computed(() => {
    const day = this.selectedDay().toString().padStart(2, '0');
    const month = this.selectedMonth().toString().padStart(2, '0');
    const year = this.selectedYear();
    return `${year}-${month}-${day}`;
  });

  constructor() {
    effect(() => {
      const val = this.value();
      if (val) {
        this.parseDate(val);
      }
    });

    effect(() => {
      const formatted = this.formattedDate();
      this.dateChange.emit(formatted);
    });
  }

  private parseDate(dateString: string): void {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        this.selectedDay.set(date.getDate());
        this.selectedMonth.set(date.getMonth() + 1);
        this.selectedYear.set(date.getFullYear());
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  }

  onDayChange(dayValue: string): void {
    const day = parseInt(dayValue, 10);
    if (day >= 1) {
      this.selectedDay.set(day);
    }
  }

  onMonthChange(monthValue: string): void {
    const month = parseInt(monthValue, 10);
    if (month >= 1 && month <= 12) {
      this.selectedMonth.set(month);
      const daysInMonth = new Date(this.selectedYear(), month, 0).getDate();
      if (this.selectedDay() > daysInMonth) {
        this.selectedDay.set(daysInMonth);
      }
    }
  }

  onYearChange(yearValue: string): void {
    const year = parseInt(yearValue, 10);
    if (year > 0) {
      this.selectedYear.set(year);
      const daysInMonth = new Date(year, this.selectedMonth(), 0).getDate();
      if (this.selectedDay() > daysInMonth) {
        this.selectedDay.set(daysInMonth);
      }
    }
  }
}
