import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgxScannerQrcodeComponent, NgxScannerQrcodeModule, ScannerQRCodeResult} from 'ngx-scanner-qrcode';
import {NgIf} from '@angular/common';
import {KeyService} from '../service/key.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ContactService} from '../service/contact.service';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../service/api.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-contact-view',
  imports: [
    NgxScannerQrcodeModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './add-contact-view.component.html',
  styleUrl: './add-contact-view.component.css'
})
export class AddContactViewComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  scanning: boolean = false;
  scannedKey: string | null = null;
  scannedHash: string | null = null;
  aliasInput: string = '';
  constraints: MediaStreamConstraints = {
    video: {
      facingMode: {
        ideal: 'environment'
      },
    }
  }

  constructor(
    private keyService: KeyService,
    private contactService: ContactService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {
    const hash = this.route.snapshot.paramMap.get('hash');
    if (hash) {
      const key = await this.apiService.searchForKey(hash);
      if (key.public_key && key.hash) {
        this.scannedKey = key.public_key;
        this.scannedHash = key.hash;
      } else {
        this.startScanner();
      }
    } else {
      this.startScanner();
    }
  }

  ngAfterViewInit() {

  }

  private startScanner() {
    this.scanning = true;
    if (this.scanner) {
      this.scanner.start()
    } else {
      setTimeout(() => {
        this.scanner.start()
      })
    }
  }

  async scannerResult(ev: ScannerQRCodeResult[]) {
    if (ev.length === 1) {
      this.scanner.stop();
      this.scanning = false;
      this.scannedKey = ev[0].value
      this.scannedHash = await this.keyService.generateHash(ev[0].value)
    }
  }

  async save() {
    if (this.scannedKey) {
      try {
        await this.contactService.addContact(
          this.aliasInput,
          this.scannedKey
        )
      } catch (e: any) {
        this.snackBar.open(e.message, 'OK', {})
      }

    }
    await this.router.navigateByUrl("/")
  }

  ngOnDestroy(): void {
    if (this.scanner) this.scanner.stop();
  }

}
