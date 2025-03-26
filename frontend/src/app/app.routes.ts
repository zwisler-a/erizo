import {Routes} from '@angular/router';
import {IdentityViewComponent} from './components/identity-view/identity-view.component';
import {HomeViewComponent} from './components/home-view/home-view.component';
import {AddContactViewComponent} from './components/add-contact-view/add-contact-view.component';
import {ConnectionListViewComponent} from './components/connection-list-view/connection-list-view.component';
import {UploadImageViewComponent} from './components/upload-image-view/upload-image-view.component';
import {ConnectionViewComponent} from './components/connection-view/connection-view.component';
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {ShellComponent} from './components/shell/shell.component';
import {NotificationsComponent} from './components/notifications/notifications.component';
import {
  AcceptConnectionRequestComponent
} from './components/accept-connection-request/accept-connection-request.component';
import { ConnectionRequestViewComponent } from './components/connection-request-view/connection-request-view.component';

export const routes: Routes = [
  {path: 'landing', component: LandingPageComponent},
  {
    path: '', component: ShellComponent, children: [
      {path: 'home', component: HomeViewComponent},
      {path: 'identity', component: IdentityViewComponent},
      {path: 'notifications', component: NotificationsComponent},
      {path: 'add-contact', component: AddContactViewComponent},
      {path: 'add-contact/:fingerprint', component: AddContactViewComponent},
      {path: 'accept-contact/:fingerprint', component: AcceptConnectionRequestComponent},
      {path: 'connections', component: ConnectionListViewComponent},
      {path: 'connections/open', component: ConnectionRequestViewComponent},
      {path: 'connection/:fingerprint', component: ConnectionViewComponent},
      {path: 'upload/:fingerprint', component: UploadImageViewComponent},
      {path: '**', redirectTo: 'home'}
    ]
  },

];
