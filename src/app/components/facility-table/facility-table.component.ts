import { Component, inject } from '@angular/core';
import { SmartTableComponent } from '../smart-table/smart-table.component';
import { FacilityDataService } from '../../services/data-sources/facility-data.service';
import { facilityTableConfig } from '../../configs/tables/facility-table.config';

@Component({
  selector: 'app-facility-table',
  standalone: true,
  imports: [SmartTableComponent],
  templateUrl: './facility-table.component.html',
  styleUrl: './facility-table.component.css',
})
export class FacilityTableComponent {
  dataService = inject(FacilityDataService);
  config = facilityTableConfig;
}
