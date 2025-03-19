import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {ApiService} from '../service/api.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-home-view',
  imports: [MatButtonModule, RouterLink, MatProgressSpinnerModule, NgIf, MatIconModule],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.css'
})
export class HomeViewComponent {
  messages: ({ url: SafeUrl })[] = [];
  loading = false;

  constructor(private api: ApiService, private sanitizer: DomSanitizer) {
    this.init()
  }

  async init() {
    this.loading = true;
    this.api.fetchMessages().subscribe({
      next: msg => {
        const uint8Array = new Uint8Array(msg.image);
        const binary = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
        const base64String = window.btoa(binary);
        const url = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${base64String}`);
        this.messages.push({...msg, url});
      },
      complete: () => {
        this.loading = false;
      }
    });

  }

}
