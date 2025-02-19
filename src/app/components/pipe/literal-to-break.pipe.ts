import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'literalToBreak',
})
export class LiteralToBreakPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/\\n/g, '\n');
  }
}
