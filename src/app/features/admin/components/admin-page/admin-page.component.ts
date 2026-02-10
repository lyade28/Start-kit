import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { TableConfig, TableRowAction } from '../../../../shared/models/table.model';
import { ADMIN_FORM_FIELDS } from '../../config/admin-form.config';

interface AdminRow {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DynamicFormComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent {
  rows: AdminRow[] = [
    { id: 1, name: 'Rapport ventes', status: 'Actif', createdAt: '2026-01-10' },
    { id: 2, name: 'Rapport stock', status: 'Brouillon', createdAt: '2026-01-15' },
    { id: 3, name: 'Rapport finances', status: 'Archivé', createdAt: '2025-12-20' }
  ];

  tableConfig: TableConfig = {
    columns: [
      { id: 'id', header: 'ID', field: 'id', type: 'number', width: '60px', align: 'right' },
      { id: 'name', header: 'Nom', field: 'name', type: 'text' },
      { id: 'status', header: 'Statut', field: 'status', type: 'badge' },
      { id: 'createdAt', header: 'Créé le', field: 'createdAt', type: 'date' }
    ],
    rowActions: [
      { id: 'view', type: 'view', label: 'Voir' },
      { id: 'edit', type: 'edit', label: 'Éditer' },
      { id: 'delete', type: 'delete', label: 'Supprimer' }
    ]
  };

  onRowAction(event: { action: TableRowAction; row: any }): void {
    const row = event.row as AdminRow;
    // Exemple : à adapter selon le projet
    console.log('Action sur ligne', event.action.id, row);
  }

  // Exemple d'utilisation du DynamicForm : on réutilise la config ADMIN_FORM_FIELDS
  adminFormFields = ADMIN_FORM_FIELDS;

  onFormSubmitted(value: Record<string, unknown>): void {
    // Exemple : ici tu enverras la valeur au backend ou mettras à jour le tableau
    console.log('Formulaire admin soumis', value);
  }
}

