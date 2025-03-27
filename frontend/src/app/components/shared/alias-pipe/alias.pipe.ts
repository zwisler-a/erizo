import { Pipe, PipeTransform } from '@angular/core';
import { ContactService } from '../../../service/contact.service';

@Pipe({
  name: 'alias',
  pure: false,
})
export class AliasPipePipe implements PipeTransform {

  private value!: string;
  private promise!: Promise<string | null>;

  constructor(private contactService: ContactService) {
  }

  transform(value: string): Promise<string | null> {
    if (this.value !== value) {
      this.value = value;
      this.promise = this.contactService.getAlias(value);
    }
    return this.promise;
  }

}
