import {Component, NgZone} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {App} from '@capacitor/app';
import {PersistenceService} from '../../services/persistence.service';

@Component({
  selector: 'app-privacy-lock',
  imports: [
    MatIcon,
    NgIf
  ],
  templateUrl: './privacy-lock.component.html',
  styleUrl: './privacy-lock.component.css'
})
export class PrivacyLockComponent {

  locked = true;

  constructor(private zone: NgZone, private persistenceService: PersistenceService) {
    App.addListener('resume', () => {
      this.zone.run(() => {
        this.lockIfNeeded();
      });
    });
    this.lockIfNeeded();
  }

  private async lockIfNeeded() {
    const enabled = (await this.persistenceService.getItem('privacy-lock')) ?? true;
    if (enabled) {
      this.locked = true;
    } else {
      this.locked = false;
    }
  }

  unlock() {
    this.locked = false;
  }
}
