import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { ContactService } from '../../service/contact.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-accept-connection-request',
  imports: [
    MatButton,
    MatFormField,
    MatInputModule,
    MatLabel,
    FormsModule,
  ],
  templateUrl: './accept-connection-request.component.html',
  styleUrl: './accept-connection-request.component.css',
})
export class AcceptConnectionRequestComponent implements OnInit {
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
    await this.contactService.addAlias(this.fingerprint!, this.alias);
    this.contactService.acceptContactRequest(this.fingerprint!).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
