import {Component, inject, provideAppInitializer} from '@angular/core';
import {ShellComponent} from './shell/shell.component';
import {initIdentity} from './service/init';
import {KeyService} from './service/key.service';
import {ContactService} from './service/contact.service';

@Component({
  selector: 'app-root',
  imports: [
    ShellComponent
  ],
  providers: [

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
