import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ComplianceRecord } from '../../../core/models/compliance.models';

interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  deadlines: ComplianceRecord[];
}

@Component({
  selector: 'as-deadline-calendar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div class="calendar-wrapper">
      <!-- Header -->
      <div class="cal-header">
        <div class="cal-nav">
          <button class="nav-btn" (click)="prevMonth()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="cal-title">{{ monthTitle() }}</span>
          <button class="nav-btn" (click)="nextMonth()">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
        <div class="cal-actions">
          <button class="today-btn" (click)="goToday()">Today</button>
          <button class="export-btn" (click)="exportICal(allDeadlines())" [disabled]="loading()">
            <mat-icon>calendar_export</mat-icon>
            Export iCal
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="cal-loading"><mat-spinner diameter="36" /></div>
      }

      <!-- Legend -->
      <div class="cal-legend">
        <span class="legend-item"><span class="dot dot-tax"></span>Tax</span>
        <span class="legend-item"><span class="dot dot-social"></span>Social Security</span>
        <span class="legend-item"><span class="dot dot-hr"></span>HR / Labour</span>
        <span class="legend-item"><span class="dot dot-legal"></span>Legal / Registry</span>
      </div>

      <!-- Weekday headers -->
      <div class="cal-grid">
        @for (day of weekDays; track day) {
          <div class="cal-weekday">{{ day }}</div>
        }

        <!-- Day cells -->
        @for (cell of calendarCells(); track cell.date.toISOString()) {
          <div
            class="cal-day"
            [class.other-month]="!cell.isCurrentMonth"
            [class.today]="cell.isToday"
            [class.has-deadlines]="cell.deadlines.length > 0"
            (click)="selectDay(cell)"
            [class.selected]="selectedDay() !== null && selectedDay()?.date?.toDateString() === cell.date.toDateString()"
          >
            <span class="day-num">{{ cell.dayNum }}</span>
            @if (cell.deadlines.length > 0) {
              <div class="dot-row">
                @for (d of cell.deadlines.slice(0, 4); track d.id) {
                  <span
                    class="dot"
                    [class]="'dot-' + authorityType(d.authority)"
                    [matTooltip]="d.requirement_title"
                  ></span>
                }
                @if (cell.deadlines.length > 4) {
                  <span class="dot-more">+{{ cell.deadlines.length - 4 }}</span>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Day detail popup -->
      @if (selectedDay() && selectedDay()!.deadlines.length > 0) {
        <div class="day-popup">
          <div class="popup-header">
            <span class="popup-date">{{ selectedDay()!.date | date:'EEEE, MMMM d, y' }}</span>
            <button class="popup-close" (click)="selectedDay.set(null)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="popup-list">
            @for (d of selectedDay()!.deadlines; track d.id) {
              <div class="popup-item" [class]="'popup-item-' + authorityType(d.authority)">
                <div class="popup-item-dot" [class]="'dot-' + authorityType(d.authority)"></div>
                <div class="popup-item-body">
                  <div class="popup-item-title">{{ d.requirement_title }}</div>
                  <div class="popup-item-meta">
                    <span class="popup-authority">{{ d.authority }}</span>
                    <span class="popup-status" [class]="'status-' + d.status">{{ d.status }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-wrapper {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }
    .cal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .cal-nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cal-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      min-width: 180px;
      text-align: center;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--surface-card);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s;
    }
    .nav-btn:hover { background: var(--brand-subtle); color: var(--brand); border-color: var(--brand); }
    .cal-actions { display: flex; gap: 10px; }
    .today-btn {
      padding: 6px 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--surface-card);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.15s;
    }
    .today-btn:hover { background: var(--brand-subtle); color: var(--brand); border-color: var(--brand); }
    .export-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--brand);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: opacity 0.15s;
    }
    .export-btn:hover { opacity: 0.85; }
    .export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .export-btn mat-icon { font-size: 1rem; height: 1rem; width: 1rem; }
    .cal-loading {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
    .cal-legend {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .cal-weekday {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-faint);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 6px 0;
    }
    .cal-day {
      min-height: 70px;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 6px;
      cursor: pointer;
      transition: all 0.12s;
      background: var(--surface-card);
      position: relative;
    }
    .cal-day:hover { background: var(--surface-hover); border-color: var(--border-color); }
    .cal-day.other-month { opacity: 0.35; }
    .cal-day.today { border-color: var(--brand) !important; background: var(--brand-subtle); }
    .cal-day.today .day-num { color: var(--brand); font-weight: 800; }
    .cal-day.has-deadlines { border-color: var(--border-color); }
    .cal-day.selected { border-color: var(--accent) !important; background: var(--accent-subtle); }
    .day-num {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: block;
      margin-bottom: 4px;
    }
    .dot-row {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-top: 2px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-tax    { background: #4f46e5; }
    .dot-social { background: #0d9488; }
    .dot-hr     { background: #16a34a; }
    .dot-legal  { background: #d97706; }
    .dot-other  { background: #94a3b8; }
    .dot-more {
      font-size: 0.6rem;
      color: var(--text-faint);
      font-weight: 700;
    }
    /* Day Popup */
    .day-popup {
      margin-top: 16px;
      background: var(--surface-hover);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--surface-card);
      border-bottom: 1px solid var(--border-color);
    }
    .popup-date {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .popup-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      padding: 2px;
      border-radius: 4px;
    }
    .popup-close:hover { color: var(--text-primary); }
    .popup-list { padding: 8px; display: flex; flex-direction: column; gap: 6px; }
    .popup-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
    }
    .popup-item-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }
    .popup-item-body { flex: 1; min-width: 0; }
    .popup-item-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popup-item-meta {
      display: flex;
      gap: 8px;
      margin-top: 2px;
      align-items: center;
    }
    .popup-authority {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .popup-status {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 1px 6px;
      border-radius: 20px;
    }
    .status-compliant { background: rgba(13,148,136,0.12); color: #0d9488; }
    .status-pending   { background: rgba(245,158,11,0.12);  color: #d97706; }
    .status-overdue   { background: rgba(239,68,68,0.12);   color: #dc2626; }
    .status-exempt    { background: rgba(148,163,184,0.12); color: #64748b; }
    @media (max-width: 600px) {
      .cal-day { min-height: 50px; }
      .cal-header { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class DeadlineCalendarComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  loading     = signal(false);
  allDeadlines = signal<ComplianceRecord[]>([]);
  selectedDay  = signal<CalendarDay | null>(null);

  private readonly today = new Date();
  currentYear  = signal(this.today.getFullYear());
  currentMonth = signal(this.today.getMonth()); // 0-indexed

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthTitle = computed(() => {
    return new Date(this.currentYear(), this.currentMonth(), 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  calendarCells = computed((): CalendarDay[] => {
    const year  = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const cells: CalendarDay[] = [];
    const todayStr = this.today.toDateString();

    // Pad start
    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month, -firstDay.getDay() + i + 1);
      cells.push({ date: d, dayNum: d.getDate(), isCurrentMonth: false, isToday: false, deadlines: [] });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const deadlines = this.allDeadlines().filter(r => r.due_date === dateStr);
      cells.push({ date, dayNum: d, isCurrentMonth: true, isToday: date.toDateString() === todayStr, deadlines });
    }

    // Pad end to fill 6 rows (42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({ date: d, dayNum: i, isCurrentMonth: false, isToday: false, deadlines: [] });
    }

    return cells;
  });

  ngOnInit(): void { this.loadDeadlines(); }

  loadDeadlines(): void {
    this.loading.set(true);
    this.api.getPaginated<ComplianceRecord>('compliance/records/', { page_size: 200 }).subscribe({
      next: (res) => {
        this.allDeadlines.set(res.results);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load deadlines.'); },
    });
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.selectedDay.set(null);
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.selectedDay.set(null);
  }

  goToday(): void {
    this.currentYear.set(this.today.getFullYear());
    this.currentMonth.set(this.today.getMonth());
    this.selectedDay.set(null);
  }

  selectDay(cell: CalendarDay): void {
    if (cell.deadlines.length === 0) { this.selectedDay.set(null); return; }
    this.selectedDay.set(cell);
  }

  authorityType(auth: string): string {
    if (!auth) return 'other';
    const a = auth.toLowerCase();
    if (a.includes('tax'))      return 'tax';
    if (a.includes('social') || a.includes('security')) return 'social';
    if (a.includes('labour') || a.includes('hr') || a.includes('labor')) return 'hr';
    if (a.includes('registry') || a.includes('legal') || a.includes('business')) return 'legal';
    return 'other';
  }

  exportICal(deadlines: ComplianceRecord[]): void {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AuditShield//Compliance Calendar//EN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ];
    deadlines.forEach(d => {
      const dateStr = new Date(d.due_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${d.id}@auditshield`);
      lines.push(`DTSTART:${dateStr}`);
      lines.push(`SUMMARY:${d.requirement_title}`);
      lines.push(`DESCRIPTION:${d.authority || ''}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'compliance-calendar.ics'; a.click();
    URL.revokeObjectURL(url);
  }
}
