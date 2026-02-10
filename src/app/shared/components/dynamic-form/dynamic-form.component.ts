import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldConfig } from '../../models/form-field.model';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnChanges {
  @Input() fields: FieldConfig[] = [];
  @Input() initialValue: Record<string, unknown> = {};

  @Output() submitted = new EventEmitter<Record<string, unknown>>();

  form: FormGroup = new FormGroup({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['initialValue']) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const group: Record<string, FormControl> = {};
    for (const field of this.fields) {
      const value = this.initialValue[field.id] ?? null;
      const validators = field.required ? [Validators.required] : [];
      group[field.id] = new FormControl({ value, disabled: field.readOnly }, validators);
    }
    this.form = new FormGroup(group);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }
}

