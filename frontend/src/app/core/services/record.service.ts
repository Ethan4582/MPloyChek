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

  getRecords(): Observable<RecordsResponse> {
    this.loadingSignal.set(true);
    return this.http.get<RecordsResponse>('/api/records').pipe(
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
}
