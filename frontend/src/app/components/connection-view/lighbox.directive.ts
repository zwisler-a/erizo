import { Directive, ElementRef, HostListener, Renderer2, Input, TemplateRef, ViewContainerRef, EmbeddedViewRef } from '@angular/core';

@Directive({
  selector: '[appLightbox]'
})
export class LightboxDirective {
  @Input() appLightboxInfo!: TemplateRef<any>;
  private overlay!: HTMLElement;
  private imgElement!: HTMLImageElement;
  private viewRef: EmbeddedViewRef<any> | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef
  ) {
    this.createLightbox();
  }

  private createLightbox(): void {
    this.overlay = this.renderer.createElement('div');
    this.renderer.setStyle(this.overlay, 'position', 'fixed');
    this.renderer.setStyle(this.overlay, 'top', '0');
    this.renderer.setStyle(this.overlay, 'left', '0');
    this.renderer.setStyle(this.overlay, 'width', '100vw');
    this.renderer.setStyle(this.overlay, 'height', '100vh');
    this.renderer.setStyle(this.overlay, 'background', 'rgba(0, 0, 0, 0.8)');
    this.renderer.setStyle(this.overlay, 'display', 'flex');
    this.renderer.setStyle(this.overlay, 'flex-direction', 'column');
    this.renderer.setStyle(this.overlay, 'justify-content', 'center');
    this.renderer.setStyle(this.overlay, 'align-items', 'center');
    this.renderer.setStyle(this.overlay, 'z-index', '1000');
    this.renderer.setStyle(this.overlay, 'cursor', 'pointer');

    this.imgElement = this.renderer.createElement('img');
    this.renderer.setStyle(this.imgElement, 'max-width', '95%');
    this.renderer.setStyle(this.imgElement, 'max-height', '95%');

    this.renderer.appendChild(this.overlay, this.imgElement);
    this.renderer.listen(this.overlay, 'click', () => this.closeLightbox());
  }

  @HostListener('click')
  openLightbox(): void {
    const imgSrc = this.el.nativeElement.src;
    if (imgSrc) {
      this.imgElement.src = imgSrc;
      this.renderer.appendChild(document.body, this.overlay);

      if (this.appLightboxInfo) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.appLightboxInfo);
        this.viewRef.rootNodes.forEach(node => this.renderer.appendChild(this.overlay, node));
      }
    }
  }

  private closeLightbox(): void {
    this.renderer.removeChild(document.body, this.overlay);
    if (this.viewRef) {
      this.viewRef.destroy();
      this.viewRef = null;
    }
  }
}
