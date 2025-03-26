import { Component } from '@angular/core';
import { UserService } from './service/user.service';
import { RouterOutlet } from '@angular/router';
import { ContactService } from './service/contact.service';
import { NotificationService } from './service/notification.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ],
  providers: [
    UserService,
  ],
  template: `
    <router-outlet></router-outlet>`,
})
export class AppComponent {

  constructor(private contactService: ContactService, private notificationService: NotificationService) {
    this.notificationService.enableNotifications();
  }

}
