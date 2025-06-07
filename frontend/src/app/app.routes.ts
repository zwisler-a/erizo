import { Routes } from '@angular/router';
import { UserPageComponent } from './components/pages/user-page/user-page.component';
import { HomePageComponent } from './components/pages/home-page/home-page.component';
import {
  AddContactViewComponent,
} from './components/pages/connections-page/request-connection-view/add-contact-view.component';
import { ConnectionsPageComponent } from './components/pages/connections-page/connections-page.component';
import { UploadImageViewComponent } from './components/pages/thread-page/upload-image-view/upload-image-view.component';
import { ThreadPageComponent } from './components/pages/thread-page/thread-page.component';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { ShellComponent } from './components/shell/shell.component';
import { NotificationPageComponent } from './components/pages/notification-page/notification-page.component';
import {
  AcceptConnectionViewComponent,
} from './components/pages/connections-page/accept-connection-view/accept-connection-view.component';
import { PostViewComponent } from './components/pages/thread-page/post-view/post-view.component';
import {
  CreateThreadViewComponent,
} from './components/pages/connections-page/create-thread-view/create-thread-view.component';
import { ThreadDataResolver } from './components/pages/thread-page/thread.resolver';
import { SharePageComponent } from './components/pages/share-page/share-page.component';
import { TakePhotoComponent } from './components/pages/upload-page/take-photo/take-photo.component';
import { EditPostComponent } from './components/pages/upload-page/edit-post/edit-post.component';
import { SetAppAuthPageComponent } from './components/pages/set-app-auth-page/set-app-auth-page.component';

export const URLS = {
  HOME: 'home',
  SHARE: 'share',
  NOTIFICATIONS: 'notifications',
  CONNECTIONS: 'connections',
  IDENTITY: 'identity',
  LANDING: 'landing',
  CREATE_THREAD: 'thread/create',
  TAKE_PHOTO: 'photo/take',
  SEND_POST: 'photo/send',
  SET_APP_AUTH: 'appauth',
  ADD_CONNECTION: 'add-contact/:fingerprint',
  ADD_CONNECTION_FN: (fingerprint: string) => '/' + URLS.ADD_CONNECTION.replace(':fingerprint', fingerprint),
  ACCEPT_CONNECTION: 'accept-contact/:fingerprint',
  ACCEPT_CONNECTION_FN: (fingerprint: string) => '/' + URLS.ACCEPT_CONNECTION.replace(':fingerprint', fingerprint),
  THREAD: 'thread/:id',
  THREAD_FN: (id: number | string) => '/' + URLS.THREAD.replace(':id', id.toString()),
  VIEW_POST: 'post/:postId',
  VIEW_POST_FN: (postId: number | string) => '/' + URLS.VIEW_POST.replace(':postId', postId.toString()),

};

export const routes: Routes = [
  { path: 'landing', component: LandingPageComponent },
  {
    path: '', component: ShellComponent,
    children: [
      { path: URLS.HOME, component: HomePageComponent },
      { path: URLS.SHARE, component: SharePageComponent },
      { path: URLS.IDENTITY, component: UserPageComponent },
      { path: URLS.SET_APP_AUTH, component: SetAppAuthPageComponent },
      { path: URLS.CREATE_THREAD, component: CreateThreadViewComponent },
      { path: URLS.NOTIFICATIONS, component: NotificationPageComponent },
      { path: URLS.CONNECTIONS, component: ConnectionsPageComponent },
      { path: URLS.ADD_CONNECTION, component: AddContactViewComponent },
      { path: URLS.ACCEPT_CONNECTION, component: AcceptConnectionViewComponent },
      { path: URLS.THREAD, component: ThreadPageComponent, resolve: { thread: ThreadDataResolver } },
      { path: URLS.VIEW_POST, component: PostViewComponent },
      { path: URLS.TAKE_PHOTO, component: TakePhotoComponent },
      { path: URLS.SEND_POST, component: EditPostComponent },
      { path: '**', redirectTo: URLS.HOME },
    ],
  },
];

