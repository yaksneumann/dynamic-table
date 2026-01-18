import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SmartTableComponent } from './components/smart-table/smart-table.component';
import { FacilityDataService } from './services/data-sources/facility-data.service';
import { facilityTableConfig } from './configs/tables/facility-table.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SmartTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly dataService = inject(FacilityDataService);
  readonly config = facilityTableConfig;
}
