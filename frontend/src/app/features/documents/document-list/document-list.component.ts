import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'as-document-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Document List</h1>
        <p class="page-subtitle">This section is under active development.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 4px; color: #1e293b; }
    .page-subtitle { color: #64748b; margin: 0; }
  `],
})
export class DocumentListComponent {}
