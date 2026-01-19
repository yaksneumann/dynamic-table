import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SmartTableComponent } from './components/smart-table/smart-table.component';
import { MOCK_FACILITY_DATA, MOCK_EMPLOYEE_DATA } from './models/mock-data';
import { facilityTableConfig } from './configs/facility-table.config';
import { employeeTableConfig } from './configs/employee-table.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SmartTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly facilityData = MOCK_FACILITY_DATA;
  readonly facilityConfig = facilityTableConfig;

  readonly employeeData = MOCK_EMPLOYEE_DATA;
  readonly employeeConfig = employeeTableConfig;
}
