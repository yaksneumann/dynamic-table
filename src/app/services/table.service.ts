import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableService<T extends { id: string }> {
  update(item: T): Observable<T> {
    // Simulate API call
    return of(item).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    // Simulate API call
    return of(void 0).pipe(delay(300));
  }

  add(item: T): Observable<T> {
    // Simulate API call
    return of(item).pipe(delay(300));
  }
}
