import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ColumnConfig,
  FilterCondition,
} from '../../models/table.config.interface';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
})
export class FilterPanelComponent<T> {
  // Inputs
  isOpen = input.required<boolean>();
  filterableColumns = input.required<ColumnConfig<T>[]>();
  conditions = input.required<FilterCondition<T>[]>();
  logic = input.required<'and' | 'or'>();
  operatorOptions = input.required<
    Array<{
      value: FilterCondition<T>['operator'];
      label: string;
    }>
  >();

  // Outputs
  close = output<void>();
  logicChange = output<'and' | 'or'>();
  addCondition = output<void>();
  removeCondition = output<number>();
  updateConditionField = output<{ index: number; field: string }>();
  updateConditionOperator = output<{
    index: number;
    operator: FilterCondition<T>['operator'];
  }>();
  updateConditionValue = output<{ index: number; value: unknown }>();
  updateConditionValueTo = output<{ index: number; value: unknown }>();
  clearFilters = output<void>();

  // Methods
  onClose(): void {
    this.close.emit();
  }

  onLogicChange(logic: 'and' | 'or'): void {
    this.logicChange.emit(logic);
  }

  onAddCondition(): void {
    this.addCondition.emit();
  }

  onRemoveCondition(index: number): void {
    this.removeCondition.emit(index);
  }

  onUpdateField(index: number, field: string): void {
    this.updateConditionField.emit({ index, field });
  }

  onUpdateOperator(
    index: number,
    operator: FilterCondition<T>['operator'],
  ): void {
    this.updateConditionOperator.emit({ index, operator });
  }

  onUpdateValue(index: number, value: unknown): void {
    this.updateConditionValue.emit({ index, value });
  }

  onUpdateValueTo(index: number, value: unknown): void {
    this.updateConditionValueTo.emit({ index, value });
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  needsValue(operator: FilterCondition<T>['operator']): boolean {
    return operator !== 'isEmpty' && operator !== 'isNotEmpty';
  }

  needsValueTo(operator: FilterCondition<T>['operator']): boolean {
    return operator === 'between';
  }
}
