import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnConfig } from '../../models/table.config.interface';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-panel.html',
  styleUrl: './search-panel.css',
})
export class SearchPanelComponent<T> {
  searchableColumns = input.required<ColumnConfig<T>[]>();
  selectedColumns = input.required<ColumnConfig<T>['key'][]>();
  searchMode = input.required<'any' | 'all'>();
  isOpen = input.required<boolean>();

  close = output<void>();
  searchModeChange = output<'any' | 'all'>();
  columnToggle = output<ColumnConfig<T>>();

  onClose(): void {
    this.close.emit();
  }

  onSearchModeChange(mode: 'any' | 'all'): void {
    this.searchModeChange.emit(mode);
  }

  onColumnToggle(column: ColumnConfig<T>): void {
    this.columnToggle.emit(column);
  }

  isColumnSelected(column: ColumnConfig<T>): boolean {
    return this.selectedColumns().includes(column.key);
  }
}
