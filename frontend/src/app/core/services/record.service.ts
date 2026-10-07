import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { RecordsResponse, IEmployeeRecord, RecordAccessSummary } from '../models/record.models';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private http = inject(HttpClient);

  private loadingSignal = signal<boolean>(false);
  readonly isLoading = this.loadingSignal.asReadonly();

  private recordsSignal = signal<IEmployeeRecord[]>([]);
  readonly records = this.recordsSignal.asReadonly();

  private metaSignal = signal<RecordAccessSummary | null>(null);
  readonly meta = this.metaSignal.asReadonly();

  getRecords(delay?: number): Observable<RecordsResponse> {
    this.loadingSignal.set(true);
    const url = delay !== undefined ? `/api/records?delay=${delay}` : '/api/records';
    return this.http.get<RecordsResponse>(url).pipe(
      tap((res) => {
        if (res.success) {
          this.recordsSignal.set(res.data);
          this.metaSignal.set(res.meta);
        }
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  createRecord(recordData: Partial<IEmployeeRecord>): Observable<{ success: boolean; data: IEmployeeRecord }> {
    this.loadingSignal.set(true);
    return this.http.post<{ success: boolean; data: IEmployeeRecord }>('/api/records', recordData).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.recordsSignal.update((list) => [res.data, ...list]);
        }
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
}
