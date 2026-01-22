import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SmartTableComponent } from './components/smart-table/smart-table.component';
import { facilityTableConfig } from './configs/facility-table.config';
import { employeeTableConfig } from './configs/employee-table.config';
import {
  TableConfig,
  TableDataSource,
  TableQueryParams,
  SortState,
  TableFilters,
  FilterGroup,
  FilterCondition,
} from './models/table.config.interface';
import { EmployeeData, FacilityData } from './models/table-data.interface';
import { DemoJsonDataService } from './services/demo-json-data.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SmartTableComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private demoData = inject(DemoJsonDataService);

  readonly facilityData$ = this.demoData.getFacilityData();
  readonly facilityConfig = facilityTableConfig;
  readonly facilityModalConfig: TableConfig<FacilityData> = {
    ...facilityTableConfig,
    editMode: 'modal',
  };

  readonly employeeData$ = this.demoData.getEmployeeData();
  readonly employeeConfig = employeeTableConfig;

  readonly employeeDataSource: TableDataSource<EmployeeData> = {
    load: (params: TableQueryParams<EmployeeData>) => {
      return this.employeeData$.pipe(
        map((data) => {
          const filtered = this.applyEmployeeFilters(data, params);
          const sorted = this.applyEmployeeSort(filtered, params.sort);
          const start = (params.page - 1) * params.pageSize;
          const end = start + params.pageSize;
          const items = sorted.slice(start, end);
          return { items, total: sorted.length };
        }),
      );
    },
  };

  private applyEmployeeFilters(
    data: EmployeeData[],
    params: TableQueryParams<EmployeeData>,
  ): EmployeeData[] {
    let result = data;

    if (params.searchTerm) {
      const search = params.searchTerm.toLowerCase();
      const columns = (params.searchColumns?.length
        ? params.searchColumns
        : (Object.keys(data[0] ?? {}) as Array<keyof EmployeeData>)) as Array<
        keyof EmployeeData
      >;
      const mode = params.searchMode ?? 'any';

      result = result.filter((row) => {
        const matches = columns.map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return false;
          if (typeof value === 'object') {
            return JSON.stringify(value).toLowerCase().includes(search);
          }
          return String(value).toLowerCase().includes(search);
        });
        return mode === 'all' ? matches.every(Boolean) : matches.some(Boolean);
      });
    }

    if (params.filters) {
      result = result.filter((row) =>
        this.evaluateFilters(params.filters as TableFilters<EmployeeData>, row),
      );
    }

    return result;
  }

  private applyEmployeeSort(
    data: EmployeeData[],
    sort?: SortState<EmployeeData>,
  ): EmployeeData[] {
    if (!sort) return data;
    const direction = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof EmployeeData;
    return [...data].sort((a, b) => {
      const av = a[key] as unknown;
      const bv = b[key] as unknown;
      if (av === bv) return 0;
      if (av === null || av === undefined) return -1 * direction;
      if (bv === null || bv === undefined) return 1 * direction;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * direction;
      }
      return String(av).localeCompare(String(bv), 'he', { numeric: true }) * direction;
    });
  }

  private evaluateFilters(
    filters: TableFilters<EmployeeData>,
    row: EmployeeData,
  ): boolean {
    if (this.isFilterGroup(filters)) {
      return this.evaluateFilterGroup(filters, row);
    }

    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      const rowValue = (row as unknown as Record<string, unknown>)[key];
      if (Array.isArray(rowValue)) {
        return rowValue.includes(value);
      }
      if (typeof rowValue === 'string') {
        return rowValue.toLowerCase().includes(String(value).toLowerCase());
      }
      return rowValue === value;
    });
  }

  private isFilterGroup(filters: unknown): filters is FilterGroup<EmployeeData> {
    return (
      typeof filters === 'object' &&
      filters !== null &&
      'logic' in filters &&
      'conditions' in filters
    );
  }

  private evaluateFilterGroup(
    group: FilterGroup<EmployeeData>,
    row: EmployeeData,
  ): boolean {
    const checks = group.conditions.map((condition) =>
      this.isFilterGroup(condition as TableFilters<EmployeeData>)
        ? this.evaluateFilterGroup(condition as FilterGroup<EmployeeData>, row)
        : this.evaluateCondition(condition as FilterCondition<EmployeeData>, row),
    );
    return group.logic === 'and'
      ? checks.every(Boolean)
      : checks.some(Boolean);
  }

  private evaluateCondition(
    condition: FilterCondition<EmployeeData>,
    row: EmployeeData,
  ): boolean {
    const rowValue = (row as unknown as Record<string, unknown>)[condition.field];
    const { operator, value, valueTo, caseSensitive } = condition;

    if (operator === 'isEmpty') {
      return (
        rowValue === null ||
        rowValue === undefined ||
        rowValue === '' ||
        (Array.isArray(rowValue) && rowValue.length === 0)
      );
    }

    if (operator === 'isNotEmpty') {
      return !(
        rowValue === null ||
        rowValue === undefined ||
        rowValue === '' ||
        (Array.isArray(rowValue) && rowValue.length === 0)
      );
    }

    if (operator === 'in' || operator === 'notIn') {
      const list = Array.isArray(value) ? value : [value];
      const contains = list.some((item) => this.areEqual(rowValue, item, caseSensitive));
      return operator === 'in' ? contains : !contains;
    }

    if (operator === 'contains') {
      if (Array.isArray(rowValue)) {
        return rowValue.some((item) => this.areEqual(item, value, caseSensitive));
      }
      return this.toComparableString(rowValue, caseSensitive).includes(
        this.toComparableString(value, caseSensitive),
      );
    }

    if (operator === 'startsWith') {
      return this.toComparableString(rowValue, caseSensitive).startsWith(
        this.toComparableString(value, caseSensitive),
      );
    }

    if (operator === 'endsWith') {
      return this.toComparableString(rowValue, caseSensitive).endsWith(
        this.toComparableString(value, caseSensitive),
      );
    }

    if (operator === 'between') {
      if (value === undefined || valueTo === undefined) return true;
      const current = this.toComparableNumber(rowValue);
      const min = this.toComparableNumber(value);
      const max = this.toComparableNumber(valueTo);
      if (current === null || min === null || max === null) return false;
      return current >= min && current <= max;
    }

    if (operator === 'gt' || operator === 'gte' || operator === 'lt' || operator === 'lte') {
      const current = this.toComparableNumber(rowValue);
      const target = this.toComparableNumber(value);
      if (current === null || target === null) return false;
      if (operator === 'gt') return current > target;
      if (operator === 'gte') return current >= target;
      if (operator === 'lt') return current < target;
      return current <= target;
    }

    if (operator === 'neq') {
      return !this.areEqual(rowValue, value, caseSensitive);
    }

    return this.areEqual(rowValue, value, caseSensitive);
  }

  private areEqual(
    left: unknown,
    right: unknown,
    caseSensitive?: boolean,
  ): boolean {
    if (left == null || right == null) return left === right;

    if (typeof left === 'string' || typeof right === 'string') {
      return (
        this.toComparableString(left, caseSensitive) ===
        this.toComparableString(right, caseSensitive)
      );
    }

    const leftNumber = this.toComparableNumber(left);
    const rightNumber = this.toComparableNumber(right);
    if (leftNumber !== null && rightNumber !== null) {
      return leftNumber === rightNumber;
    }

    return left === right;
  }

  private toComparableString(value: unknown, caseSensitive?: boolean): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return caseSensitive ? str : str.toLowerCase();
  }

  private toComparableNumber(value: unknown): number | null {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.getTime();
    }
    return null;
  }
}
