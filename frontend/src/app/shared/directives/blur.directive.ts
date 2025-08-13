import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  ViewContainerRef,
  TemplateRef,
  EmbeddedViewRef, AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appBlur]',
})
export class BlurDirective implements AfterViewInit {
  @Input('appBlur') set isEnabled(value: boolean) {
    if (!value) {
      this.removeBlur();
      this.removeOverlay();
    }
    this._appBlur = value;
    if (value) {
      this.addOverlay();
      this.applyBlur();
    }
  }

  get isEnabled(): boolean {
    return this._appBlur;
  }

  private _appBlur: boolean = false;
  @Input('appBlurAlways') alwaysBlur: boolean | string = false;
  @Input('appBlurOverlay') overlayTemplate?: TemplateRef<any>;

  private overlayElement?: HTMLElement;
  private overlayViewRef?: EmbeddedViewRef<any>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef,
  ) {

  }

  ngAfterViewInit(): void {
    this.applyBlur();
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'filter 0.1s');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  private applyBlur() {
    if (this.isEnabled) {
      this.renderer.setStyle(this.el.nativeElement, 'filter', 'blur(35px) brightness(50%)');
      this.addOverlay();
    }
  }

  private removeBlur() {
    if (this.alwaysBlur) return;
    if (this.isEnabled) {
      this.renderer.setStyle(this.el.nativeElement, 'filter', 'none');
      this.removeOverlay();
    }
  }

  private addOverlay() {
    if (this.overlayTemplate && !this.overlayElement) {
      const parent = this.el.nativeElement.parentNode;
      if (!parent) {
        return;
      }

      // Create container element for the overlay
      const container = this.renderer.createElement('div');
      this.renderer.setStyle(container, 'position', 'absolute');
      this.renderer.setStyle(container, 'top', '50%');
      this.renderer.setStyle(container, 'left', '50%');
      this.renderer.setStyle(container, 'transform', 'translate(-50%, -50%)');
      this.renderer.setStyle(container, 'z-index', '10');
      this.renderer.setStyle(container, 'pointer-events', 'none');

      // Create embedded view and append its nodes to the container
      this.overlayViewRef = this.viewContainer.createEmbeddedView(this.overlayTemplate);
      this.overlayViewRef.detectChanges();
      this.overlayViewRef.rootNodes.forEach(node => {
        this.renderer.appendChild(container, node);
      });

      // Append the container as a sibling to the blurred element
      this.renderer.appendChild(parent, container);
      this.overlayElement = container;
    }
  }

  private removeOverlay() {
    if (this.overlayElement) {
      const parent = this.el.nativeElement.parentNode;
      if (parent) {
        this.renderer.removeChild(parent, this.overlayElement);
      }
      this.overlayElement = undefined;
      if (this.overlayViewRef) {
        this.overlayViewRef.destroy();
        this.overlayViewRef = undefined;
      }
    }
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onPress(_: Event) {
    this.removeBlur();
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onRelease() {
    this.applyBlur();
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the context menu from appearing
  }
}
