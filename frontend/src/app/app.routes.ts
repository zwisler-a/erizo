import {Routes} from '@angular/router';
import {IdentityViewComponent} from './identity-view/identity-view.component';
import {HomeViewComponent} from './home-view/home-view.component';
import {AddContactViewComponent} from './add-contact-view/add-contact-view.component';
import {ConnectionListViewComponent} from './connection-list-view/connection-list-view.component';
import {UploadImageViewComponent} from './upload-image-view/upload-image-view.component';
import {ConnectionViewComponent} from './connection-view/connection-view.component';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {ShellComponent} from './shell/shell.component';
import {NotificationsComponent} from './notifications/notifications.component';

export const routes: Routes = [
  {path: 'landing', component: LandingPageComponent},
  {
    path: '', component: ShellComponent, children: [
      {path: 'home', component: HomeViewComponent},
      {path: 'identity', component: IdentityViewComponent},
      {path: 'notifications', component: NotificationsComponent},
      {path: 'add-contact', component: AddContactViewComponent},
      {path: 'add-contact/:fingerprint', component: AddContactViewComponent},
      {path: 'connections', component: ConnectionListViewComponent},
      {path: 'connection/:fingerprint', component: ConnectionViewComponent},
      {path: 'upload/:fingerprint', component: UploadImageViewComponent},
      {path: '**', redirectTo: 'home'}
    ]
  },

];
