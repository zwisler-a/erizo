import { Component, EventEmitter, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgClass, NgForOf } from '@angular/common';

@Component({
  selector: 'app-pin-input',
  imports: [
    MatButton,
    NgForOf,
    NgClass,
  ],
  templateUrl: './pin-input.component.html',
  styleUrl: './pin-input.component.css',
})
export class PinInputComponent {

  @Output() pinEntered = new EventEmitter<string>();

  okCount = 0;
  private pin = '';
  locked = false;


  keyPress(key: string) {
    if (this.locked) return;
    this.okCount++;
    this.pin = this.pin + key;
    if (this.okCount == 4) {
      this.locked = true;
      this.pinEntered.emit(this.pin);
      setTimeout(() => {
        this.locked = false;
        this.pin = '';
        this.okCount = 0;
      }, 500);
    }
  }
}
