import { FieldConfig } from '../../../shared/models/form-field.model';

export const ADMIN_FORM_FIELDS: FieldConfig[] = [
  {
    id: 'name',
    label: 'Nom du rapport',
    type: 'text',
    placeholder: 'Saisir le nom...',
    required: true
  },
  {
    id: 'status',
    label: 'Statut',
    type: 'select',
    placeholder: 'Choisir un statut',
    options: [
      { value: 'Actif', label: 'Actif' },
      { value: 'Brouillon', label: 'Brouillon' },
      { value: 'Archivé', label: 'Archivé' }
    ]
  },
  {
    id: 'createdAt',
    label: 'Date de création',
    type: 'date'
  }
];

