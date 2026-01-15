import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { DataSourceService } from '../../models/table.config.interface';
import { FacilityData } from '../../models/table-data.interface';
import { MOCK_FACILITY_DATA } from '../../models/mock-data';

@Injectable({
  providedIn: 'root',
})
export class FacilityDataService implements DataSourceService<FacilityData> {
  private dataSubject = new BehaviorSubject<FacilityData[]>(MOCK_FACILITY_DATA);

  getData(): Observable<FacilityData[]> {
    return this.dataSubject.asObservable();
  }

  getById(id: string): Observable<FacilityData> {
    const item = this.dataSubject.value.find((d) => d.id === id);
    if (!item) {
      throw new Error(`Facility with id ${id} not found`);
    }
    return of(item);
  }

  update(item: FacilityData): Observable<FacilityData> {
    const currentData = this.dataSubject.value;
    const index = currentData.findIndex((d) => d.id === item.id);

    if (index !== -1) {
      currentData[index] = item;
      this.dataSubject.next([...currentData]);
    }

    return of(item).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const currentData = this.dataSubject.value;
    const filtered = currentData.filter((d) => d.id !== id);
    this.dataSubject.next(filtered);
    return of(void 0).pipe(delay(300));
  }

  addItem(item: FacilityData): Observable<FacilityData> {
    const currentData = this.dataSubject.value;
    this.dataSubject.next([...currentData, item]);
    return of(item).pipe(delay(300));
  }
}
