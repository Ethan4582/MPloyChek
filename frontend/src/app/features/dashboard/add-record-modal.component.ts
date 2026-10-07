import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecordService } from '../../core/services/record.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-add-record-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div class="fixed inset-0" (click)="closeModal()"></div>

      <div class="relative w-full max-w-lg bg-[#202020] border border-[#333333] rounded-xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-[#2d2d2d]">
          <div class="flex items-center gap-2">
            <span class="text-lg">📋</span>
            <h2 class="text-sm font-semibold text-[#ffffff]">New Verification Audit Record</h2>
          </div>
          <button
            type="button"
            (click)="closeModal()"
            class="text-[#8a8986] hover:text-[#ffffff] p-1"
          >
            ✕
          </button>
        </div>

        <form [formGroup]="recordForm" (ngSubmit)="onSubmit()" class="space-y-3.5 text-xs">
          <div>
            <label class="block text-[#9b9a97] mb-1">Employee / Candidate Name</label>
            <input
              type="text"
              formControlName="employeeName"
              placeholder="e.g. Rachel Adams"
              class="notion-input"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#9b9a97] mb-1">Department</label>
              <input
                type="text"
                formControlName="department"
                placeholder="Software Engineering"
                class="notion-input"
              />
            </div>
            <div>
              <label class="block text-[#9b9a97] mb-1">Position / Role</label>
              <input
                type="text"
                formControlName="position"
                placeholder="Staff Systems Architect"
                class="notion-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#9b9a97] mb-1">Access Clearance</label>
              <select formControlName="accessLevel" class="notion-input bg-[#252525]">
                <option value="General">General</option>
                <option value="Confidential">Confidential</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
            <div>
              <label class="block text-[#9b9a97] mb-1">Verification Status</label>
              <select formControlName="verificationStatus" class="notion-input bg-[#252525]">
                <option value="Verified">Verified</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Flagged">Flagged</option>
              </select>
            </div>
          </div>

          <!-- Confidential Fields (Admin only) -->
          <div class="p-3 rounded-lg bg-[#252525] border border-[#332924] space-y-3">
            <div class="text-[10px] font-mono uppercase tracking-wider text-[#bc8c74]">
              Confidential Fields (Admin Restricted Projection)
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[#9b9a97] mb-1">Compensation Grade</label>
                <input
                  type="text"
                  formControlName="compensationGrade"
                  placeholder="E7 / L7 ($185k - $240k)"
                  class="notion-input"
                />
              </div>
              <div>
                <label class="block text-[#9b9a97] mb-1">Risk Score (1 - 100)</label>
                <input
                  type="number"
                  formControlName="riskScore"
                  placeholder="12"
                  class="notion-input"
                />
              </div>
            </div>

            <div>
              <label class="block text-[#9b9a97] mb-1">Audit / Background Notes</label>
              <textarea
                formControlName="auditNotes"
                rows="2"
                placeholder="Tier-2 screening completed. Clean background history."
                class="notion-input resize-none"
              ></textarea>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-end gap-2 border-t border-[#2d2d2d]">
            <button
              type="button"
              (click)="closeModal()"
              class="notion-btn py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="recordForm.invalid || isSubmitting()"
              class="notion-btn-primary py-1.5 px-4 flex items-center gap-1.5"
            >
              @if (isSubmitting()) {
                <span>Saving...</span>
              } @else {
                <span>Create Record</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AddRecordModalComponent {
  private fb = inject(FormBuilder);
  private recordService = inject(RecordService);
  private toastService = inject(ToastService);

  @Output() recordCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isSubmitting = signal<boolean>(false);

  recordForm = this.fb.group({
    employeeName: ['', [Validators.required, Validators.minLength(2)]],
    department: ['Software Engineering', [Validators.required]],
    position: ['Engineer', [Validators.required]],
    accessLevel: ['General', [Validators.required]],
    verificationStatus: ['Verified', [Validators.required]],
    compensationGrade: ['L5 ($140k - $175k)'],
    riskScore: [10],
    auditNotes: ['Background screening cleared.'],
  });

  closeModal(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.recordForm.invalid) return;

    this.isSubmitting.set(true);
    const formVal = this.recordForm.value;

    this.recordService.createRecord(formVal as any).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.success('Record Created', 'New verification audit record saved to MongoDB.');
        this.recordCreated.emit();
        this.closeModal();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.error('Creation Failed', err.error?.message || 'Could not save record.');
      },
    });
  }
}
