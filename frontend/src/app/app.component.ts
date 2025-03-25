import { Component } from '@angular/core';
import { UserService } from './service/user.service';
import { RouterOutlet } from '@angular/router';
import { ContactService } from './service/contact.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ],
  providers: [
    UserService,
  ],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {

  constructor(private contactService:ContactService) {
    this.contactService.showOpenRequestsInNotifications();
  }

}
