import {Component, OnInit} from '@angular/core';
import {NgxScannerQrcodeModule} from 'ngx-scanner-qrcode';
import {NgIf} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ContactService} from '../service/contact.service';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-contact-view',
  imports: [
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './add-contact-view.component.html',
  styleUrl: './add-contact-view.component.css'
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
    this.contactService.getConnectionRequests().subscribe(connections => console.log(connections));
    this.contactService.getConfirmedConnections().subscribe(connections => console.log(connections));
  }

  async connectToIdentity() {
    if (this.alias.length == 0) {
      this.snackBar.open("Please enter alias", "", {duration: 2000});
      return;
    }
    if (!this.fingerprint) return;
    this.contactService.requestContactConnection(this.alias, this.fingerprint).subscribe(() => {
      this.snackBar.open("Send connection request!", "", {duration: 2000});
      this.router.navigate(['/']);
    })
  }

}
