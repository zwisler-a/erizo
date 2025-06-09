import {Routes} from '@angular/router';
import {LandingPageComponent} from './core/components/landing-page/landing-page.component';
import {ShellComponent} from './core/components/shell/shell.component';
import {HomePageComponent} from './features/post/components/home-page/home-page.component';
import {SharePageComponent} from './features/post/components/share-page/share-page.component';
import {UserPageComponent} from './features/user/components/user-page/user-page.component';
import {ShareIdentityComponent} from './features/connection/components/share-identity/share-identity.component';
import {SetAppAuthPageComponent} from './features/user/components/set-app-auth-page/set-app-auth-page.component';
import {CreateThreadViewComponent} from './features/thread/components/create-thread-view/create-thread-view.component';
import {
  NotificationPageComponent
} from './features/notification/components/notification-page/notification-page.component';
import {ConnectionsPageComponent} from './features/connection/components/connections-page/connections-page.component';
import {
  AddContactViewComponent
} from './features/connection/components/request-connection-view/add-contact-view.component';
import {
  AcceptConnectionViewComponent
} from './features/connection/components/accept-connection-view/accept-connection-view.component';
import {ThreadPageComponent} from './features/thread/components/thread-page/thread-page.component';
import {ThreadDataResolver} from './features/thread/resolvers/thread.resolver';
import {PostViewComponent} from './features/post/components/post-view/post-view.component';
import {TakePhotoComponent} from './features/post/components/take-photo/take-photo.component';
import {EditPostComponent} from './features/post/components/edit-post/edit-post.component';

export const URLS = {
  HOME: 'home',
  SHARE: 'share',
  NOTIFICATIONS: 'notifications',
  CONNECTIONS: 'connections',
  IDENTITY: 'identity',
  SHARE_IDENTITY: 'share-identity',
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
  {path: 'landing', component: LandingPageComponent},
  {
    path: '', component: ShellComponent,
    children: [
      {path: URLS.HOME, component: HomePageComponent},
      {path: URLS.SHARE, component: SharePageComponent},
      {path: URLS.IDENTITY, component: UserPageComponent},
      {path: URLS.SHARE_IDENTITY, component: ShareIdentityComponent},
      {path: URLS.SET_APP_AUTH, component: SetAppAuthPageComponent},
      {path: URLS.CREATE_THREAD, component: CreateThreadViewComponent},
      {path: URLS.NOTIFICATIONS, component: NotificationPageComponent},
      {path: URLS.CONNECTIONS, component: ConnectionsPageComponent},
      {path: URLS.ADD_CONNECTION, component: AddContactViewComponent},
      {path: URLS.ACCEPT_CONNECTION, component: AcceptConnectionViewComponent},
      {path: URLS.THREAD, component: ThreadPageComponent, resolve: {thread: ThreadDataResolver}},
      {path: URLS.VIEW_POST, component: PostViewComponent},
      {path: URLS.TAKE_PHOTO, component: TakePhotoComponent},
      {path: URLS.SEND_POST, component: EditPostComponent},
      {path: '**', redirectTo: URLS.HOME},
    ],
  },
];

