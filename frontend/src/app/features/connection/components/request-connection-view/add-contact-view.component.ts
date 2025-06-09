import {Component, OnInit} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {URLS} from '../../../../app.routes';
import {ContactService} from '../../services/contact.service';

@Component({
  selector: 'app-request-connection-view',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './add-contact-view.component.html',
  styleUrl: './add-contact-view.component.css',
})
export class AddContactViewComponent implements OnInit {


  public fingerprint: string | null = null;
  public alias: string = '';

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    this.fingerprint = this.route.snapshot.paramMap.get('fingerprint');
    if (!this.fingerprint) {
      this.router.navigate(['/']);
    }
  }

  async connectToIdentity() {
    if (this.alias.length == 0) {
      this.snackBar.open('Please enter alias', '', {duration: 2000});
      return;
    }
    if (!this.fingerprint) return;
    this.contactService.requestContactConnection(this.fingerprint, this.alias).subscribe(() => {
      this.snackBar.open('Send connection request!', '', {duration: 2000});
      this.router.navigate(['/']);
    });
  }

  protected readonly URLS = URLS;
}
