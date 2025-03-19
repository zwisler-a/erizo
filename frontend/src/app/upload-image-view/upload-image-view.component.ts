import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ContactService} from '../service/contact.service';
import {KeyService} from '../service/key.service';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {ApiService} from '../service/api.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-upload-image-view',
  imports: [MatButtonModule, FormsModule, NgIf],
  template: `
    <div class="container">
      <input type="file" #fileInput accept="image/*;capture=camera" (change)="onFileSelected($event)" hidden>
      <div *ngIf="imageSrc" class="preview">
        <img [src]="imageSrc" alt="Preview"/>
      </div>
      <div class="action">
        <button mat-raised-button color="primary" (click)="fileInput.click()">Take Picture</button>
        <span class="spacer"></span>
        <button *ngIf="imageSrc" mat-flat-button color="accent" (click)="sendImage()" [disabled]="!imageSrc">
          Send
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .preview {
      margin-top: 10px;
    }

    .action {
      display: flex;
      width: 100%;
      padding: 0 16px;
      box-sizing: border-box;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .preview img {
      width: 100%;
      max-height: 80vh;
    }
  `]
})
export class UploadImageViewComponent {

  private contact: { alias: string; publicKey: string; hash: string } | undefined;
  imageSrc: string | null = null;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private keyService: KeyService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    const hash = this.route.snapshot.paramMap.get('hash')
    if (!hash) {
      this.router.navigateByUrl("/");
    } else {
      this.loadContact(hash)
    }
  }


  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imageSrc = reader.result as string;
      reader.readAsDataURL(file);
    }
  }


  private async loadContact(hash: string) {
    const contacts = await Promise.all((await this.contactService.getContacts())
      .map(async contact => ({
        ...contact,
        hash: await this.keyService.generateHash(contact.publicKey)
      })));
    this.contact = contacts.find(contact => contact.hash === hash);
    if (!this.contact) {
      this.router.navigateByUrl("/");
    }
  }

  async sendImage() {
    if (this.fileInput?.nativeElement?.files?.length === 1 && this.contact) {
      await this.apiService.sendFile(
        this.fileInput?.nativeElement?.files[0],
        await this.keyService.base64ToKey(this.contact.publicKey)
      )
      this.snackBar.open("Send!", undefined, {duration: 2500});
      this.router.navigateByUrl("/");
    }
  }
}
