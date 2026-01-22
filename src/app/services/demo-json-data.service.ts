import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { FacilityData, EmployeeData } from '../models/table-data.interface';

@Injectable({ providedIn: 'root' })
export class DemoJsonDataService {
  private http = inject(HttpClient);

  private facility$ = this.http
    .get<FacilityData[]>('data/facility.json')
    .pipe(shareReplay(1));

  private employee$ = this.http
    .get<EmployeeData[]>('data/employee.json')
    .pipe(shareReplay(1));

  getFacilityData(): Observable<FacilityData[]> {
    return this.facility$;
  }

  getEmployeeData(): Observable<EmployeeData[]> {
    return this.employee$;
  }
}
