import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFr', standalone: true })
export class DateFrPipe implements PipeTransform {
  transform(value: string | Date | number | null | undefined): string {
    if (value == null) return '';
    const date = typeof value === 'number' || typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: undefined
    }).format(date);
  }
}
