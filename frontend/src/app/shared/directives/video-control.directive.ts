// video-control.directive.ts
import { Directive, Input, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: 'video[appVideoControl]',
  standalone: true,
})
export class VideoControlDirective {
  @Input() appTapToggle = true;

  private get el(): HTMLVideoElement {
    return this.host.nativeElement as HTMLVideoElement;
  }

  constructor(private host: ElementRef, r: Renderer2) {
    r.setAttribute(this.el, 'playsinline', '');
    if (!this.el.autoplay) {
      r.setAttribute(this.el, 'preload', 'metadata');
    }
  }

  @HostListener('loadedmetadata')
  onLoadedMetadata() {
    if (this.el.autoplay) return;
    const seek = () => {
      const onSeeked = () => {
        this.el.pause();
        this.el.removeEventListener('seeked', onSeeked);
      };
      this.el.addEventListener('seeked', onSeeked, { once: true });
      this.el.currentTime = 0.001; // ensures first frame is displayed
    };
    if (this.el.readyState >= 1) {
      seek();
    } else {
      this.el.addEventListener('loadeddata', seek, { once: true });
    }
  }

  @HostListener('click')
  onClick() {
    if (!this.appTapToggle) return;
    this.el.paused ? this.el.play() : this.el.pause();
  }
}
