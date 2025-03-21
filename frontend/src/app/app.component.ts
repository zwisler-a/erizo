import {Component} from '@angular/core';
import {ShellComponent} from './shell/shell.component';
import {UserService} from './service/user.service';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    ShellComponent,
    RouterOutlet
  ],
  providers: [
    UserService,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
