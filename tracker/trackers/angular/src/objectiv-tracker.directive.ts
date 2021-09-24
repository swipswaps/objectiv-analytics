import { Directive, ElementRef, Input } from '@angular/core';
import {
  trackButton,
  trackElement,
  trackExpandableElement,
  trackInput,
  trackLink,
  TrackLocationReturnValue,
  trackMediaPlayer,
  trackNavigation,
  trackOverlay,
} from '@objectiv/tracker-browser';

/**
 * Allows calling Browser Tracker Location Trackers directly from templates
 */
@Directive({
  selector:
    '[trackButton], [trackElement], [trackExpandableElement], [trackInput], [trackLink], [trackMediaPlayer], [trackNavigation], [trackOverlay]',
})
export class ObjectivTrackerDirective {
  @Input() trackButton: { id: string; text: string };
  @Input() trackElement: { id: string };
  @Input() trackExpandableElement: { id: string };
  @Input() trackInput: { id: string };
  @Input() trackLink: { id: string; text: string; href: string };
  @Input() trackMediaPlayer: { id: string };
  @Input() trackNavigation: { id: string };
  @Input() trackOverlay: { id: string };

  constructor(public element: ElementRef<HTMLElement>) {}

  ngOnInit() {
    let trackingAttributes: TrackLocationReturnValue;

    if (this.trackButton) {
      trackingAttributes = trackButton(this.trackButton);
    }

    if (this.trackElement) {
      trackingAttributes = trackElement(this.trackElement);
    }

    if (this.trackExpandableElement) {
      trackingAttributes = trackExpandableElement(this.trackExpandableElement);
    }

    if (this.trackInput) {
      trackingAttributes = trackInput(this.trackInput);
    }

    if (this.trackLink) {
      trackingAttributes = trackLink(this.trackLink);
    }

    if (this.trackMediaPlayer) {
      trackingAttributes = trackMediaPlayer(this.trackMediaPlayer);
    }

    if (this.trackNavigation) {
      trackingAttributes = trackNavigation(this.trackNavigation);
    }

    if (this.trackOverlay) {
      trackingAttributes = trackOverlay(this.trackOverlay);
    }

    // TODO trackChildren

    if (!trackingAttributes) {
      return;
    }

    for (let [key, value] of Object.entries<string>(trackingAttributes)) {
      this.element.nativeElement.setAttribute(key, value);
    }
  }
}
