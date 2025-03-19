import {Routes} from '@angular/router';
import {IdentityViewComponent} from './identity-view/identity-view.component';
import {HomeViewComponent} from './home-view/home-view.component';
import {AddContactViewComponent} from './add-contact-view/add-contact-view.component';
import {ContactListViewComponent} from './contact-list-view/contact-list-view.component';
import {UploadImageViewComponent} from './upload-image-view/upload-image-view.component';

export const routes: Routes = [
  {path: '', component: HomeViewComponent},
  {path: 'identity', component: IdentityViewComponent},
  {path: 'add-contact', component: AddContactViewComponent},
  {path: 'add-contact/:hash', component: AddContactViewComponent},
  {path: 'select-contact', component: ContactListViewComponent},
  {path: 'upload/:hash', component: UploadImageViewComponent},
];
