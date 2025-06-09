import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import {ContactService} from '../../features/connection/services/contact.service';

@Pipe({
  name: 'alias',
  pure: false,
})
export class AliasPipePipe implements PipeTransform {
  private currentValue!: string;
  private alias: string | null = null;
  private loading = false;

  constructor(private contactService: ContactService, private cdr: ChangeDetectorRef) {}

  transform(value: string): string | null {
    if (value !== this.currentValue && !this.loading) {
      this.currentValue = value;
      this.loading = true;
      this.contactService.getAlias(value).then(result => {
        this.alias = result;
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
    return this.alias || value;
  }
}
