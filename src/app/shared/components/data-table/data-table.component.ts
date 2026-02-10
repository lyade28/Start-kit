import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableConfig, TableRowAction } from '../../models/table.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent {
  /** Données brutes (lignes) — typées en any pour rester totalement générique côté UI. */
  @Input() rows: any[] = [];
  /** Configuration de la table (colonnes, actions…) */
  @Input() config!: TableConfig;

  /** Emis lorsqu’une action de ligne est déclenchée */
  @Output() rowAction = new EventEmitter<{ action: TableRowAction; row: any }>();

  onRowAction(action: TableRowAction, row: any): void {
    this.rowAction.emit({ action, row });
  }

  getCellValue(row: any, field?: string): unknown {
    if (!field) return '';
    return field.split('.').reduce<unknown>((acc: any, key) => (acc ? acc[key] : undefined), row);
  }
}

