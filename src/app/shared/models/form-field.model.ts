export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date'
  | 'checkbox'
  | 'radio';

export interface FieldOption {
  value: string | number | boolean;
  label: string;
}

export interface FieldConfig {
  /** Identifiant du champ (clé du form) */
  id: string;
  /** Label affiché à l'utilisateur */
  label: string;
  /** Type du champ (input, select, date, etc.) */
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: FieldOption[]; // pour select / radio
  hint?: string;           // texte d'aide sous le champ
}

