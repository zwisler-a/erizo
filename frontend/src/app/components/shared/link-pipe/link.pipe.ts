import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({
  name: 'link'
})
export class LinkPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    // Regular expression to match URLs
    const urlRegex = /https?:\/\/[^\s]+/g;

    // Replace URLs with anchor tags
    const linkedValue = value.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);

    // Sanitize the HTML before returning
    return this.sanitizer.bypassSecurityTrustHtml(linkedValue);
  }
}
