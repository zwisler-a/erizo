import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  confirm(message: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const isConfirmed = window.confirm(message);
      observer.next(isConfirmed);
      observer.complete();
    });
  }

  confirmWithInput(message: string, placeholder: string): Observable<string> {
    return new Observable((observer) => {
      const userInput = prompt(message, placeholder);
      if (userInput) {
        observer.next(userInput);
      }
      observer.complete();
    });
  }
}
