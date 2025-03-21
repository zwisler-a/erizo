import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Contact, ContactService} from '../service/contact.service';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MessageService} from '../service/message.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgIf} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-upload-image-view',
  imports: [MatButtonModule, FormsModule, NgIf, MatCheckboxModule, MatTooltip, MatIcon, MatInputModule],
  template: `
    <div class="container">
      <input type="file" #fileInput accept="image/*;capture=camera" (change)="onFileSelected($event)" hidden>
      <div *ngIf="imageSrc" class="preview">
        <img [src]="imageSrc" alt="Preview"/>
      </div>
      <div class="settings" *ngIf="imageSrc">
        <mat-form-field>
          <mat-label>Delete after days</mat-label>
          <input type="number" min="1" matInput [(ngModel)]="daysToLive">
          <mat-icon matSuffix matTooltip="The message gets removed from the server after the given number of days">
            info
          </mat-icon>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Message</mat-label>
          <input maxlength="100" matInput [(ngModel)]="message">
        </mat-form-field>
      </div>
      <div class="action">
        <button mat-raised-button color="primary" (click)="fileInput.click()">Take Picture</button>
        <span class="spacer"></span>
        <button *ngIf="imageSrc" mat-flat-button color="accent" (click)="sendImage()" [disabled]="!imageSrc || disableSend">
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
      width: 100%;
      gap: 10px;
    }

    .settings {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
    }

    .settings mat-form-field {
      width: 100%;
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

  private contact: Contact | undefined;
  imageSrc: string | null = null;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  daysToLive?: number;
  message?: string;
  disableSend: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private apiService: MessageService,
    private snackBar: MatSnackBar
  ) {
    const hash = this.route.snapshot.paramMap.get('fingerprint')
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


  private async loadContact(fingerprint: string) {
    this.contact = await this.contactService.getContact(fingerprint);
    if (!this.contact) {
      this.router.navigateByUrl("/");
    }
  }

  async sendImage() {
    this.disableSend = true;
    if (this.fileInput?.nativeElement?.files?.length === 1 && this.contact) {
      await this.apiService.sendMessage(
        this.fileInput?.nativeElement?.files[0],
        this.contact,
        this.message,
        this.daysToLive
      )
      this.snackBar.open("Image was posted successfully", undefined, {duration: 2500});
      this.router.navigateByUrl("/");
    }
    this.disableSend = false;
  }
}
