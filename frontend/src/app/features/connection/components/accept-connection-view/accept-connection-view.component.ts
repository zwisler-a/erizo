import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {ContactService} from '../../services/contact.service';

@Component({
  selector: 'app-accept-connection-view',
  imports: [
    MatButton,
    MatFormField,
    MatInputModule,
    MatLabel,
    FormsModule,
  ],
  templateUrl: './accept-connection-view.component.html',
  styleUrl: './accept-connection-view.component.css',
})
export class AcceptConnectionViewComponent implements OnInit {
  fingerprint!: string | null;
  alias: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private contactService: ContactService) {

  }


  ngOnInit(): void {
    this.fingerprint = this.route.snapshot.paramMap.get('fingerprint');
    if (!this.fingerprint) {
      this.router.navigate(['/']);
    }
  }

  async accept() {
    this.contactService.acceptContactRequest(this.fingerprint!, this.alias).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
