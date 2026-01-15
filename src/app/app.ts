import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FacilityTableComponent } from './components/facility-table/facility-table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FacilityTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('dynamic-table');
}
