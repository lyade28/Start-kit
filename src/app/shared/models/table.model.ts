export type TableColumnType = 'text' | 'number' | 'date' | 'badge' | 'icon' | 'actions';

export interface TableColumn {
  /** Identifiant unique de la colonne (clé de tri, etc.) */
  id: string;
  /** Libellé affiché dans l’en-tête */
  header: string;
  /** Propriété du row sur laquelle se baser (ex. 'name', 'status.label') */
  field?: string;
  /** Type de rendu souhaité (text, date, actions, etc.) */
  type?: TableColumnType;
  /** Largeur (ex. '120px', '20%') */
  width?: string;
  /** Colonne triable ? */
  sortable?: boolean;
  /** Colonne filtrable ? */
  filterable?: boolean;
  /** Alignement du contenu (ex. 'left', 'center', 'right') */
  align?: 'left' | 'center' | 'right';
}

export type TableRowActionType = 'view' | 'edit' | 'delete' | 'custom';

export interface TableRowAction {
  /** Identifiant de l’action (ex. 'view', 'edit') */
  id: string;
  /** Type générique pour aider les adaptateurs UI (icônes, couleurs, etc.) */
  type?: TableRowActionType;
  /** Libellé (tooltip, menu, bouton) */
  label: string;
  /** Icône CSS ou nom d’icône (selon la lib UI) */
  icon?: string;
  /** Afficher comme bouton principal ? */
  primary?: boolean;
}

export interface TableBulkAction {
  id: string;
  label: string;
  icon?: string;
}

export interface TableToolbarAction {
  id: string;
  label: string;
  icon?: string;
}

export interface TableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface TableFilter {
  columnId: string;
  value: unknown;
}

export interface TablePagination {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
}

export interface TableConfig {
  /** Colonnes à afficher dans l’ordre souhaité */
  columns: TableColumn[];
  /** Actions par ligne (affichées dans une colonne Actions) */
  rowActions?: TableRowAction[];
  /** Actions sur sélection multiple (checkboxes) */
  bulkActions?: TableBulkAction[];
  /** Actions globales en toolbar */
  toolbarActions?: TableToolbarAction[];
  /** Pagination (si non défini : table non paginée) */
  pagination?: TablePagination;
  /** Tri actuel (facultatif) */
  sort?: TableSort;
  /** Filtres actuels (facultatif) */
  filters?: TableFilter[];
  /** Clé unique par ligne (ex. 'id') */
  trackBy?: string;
}

