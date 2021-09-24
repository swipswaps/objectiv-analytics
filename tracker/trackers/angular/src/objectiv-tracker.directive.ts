import { Directive, ElementRef, Input } from '@angular/core';
import {
  trackButton,
  TrackButtonParameters,
  trackChildren,
  TrackChildrenParameters,
  TrackChildrenReturnValue,
  trackElement,
  trackExpandableElement,
  trackInput,
  trackLink,
  TrackLinkParameters,
  TrackLocationHelperParameters,
  TrackLocationReturnValue,
  trackMediaPlayer,
  trackNavigation,
  trackOverlay,
} from '@objectiv/tracker-browser';

/**
 * Allows calling Browser Tracker Location Trackers and Children Tracker directly from templates
 */
@Directive({
  selector:
    '[trackButton], [trackElement], [trackExpandableElement], [trackInput], [trackLink], [trackMediaPlayer], [trackNavigation], [trackOverlay], [trackChildren]',
})
export class ObjectivTrackerDirective {
  @Input() trackButton: TrackButtonParameters;
  @Input() trackElement: TrackLocationHelperParameters;
  @Input() trackExpandableElement: TrackLocationHelperParameters;
  @Input() trackInput: TrackLocationHelperParameters;
  @Input() trackLink: TrackLinkParameters;
  @Input() trackMediaPlayer: TrackLocationHelperParameters;
  @Input() trackNavigation: TrackLocationHelperParameters;
  @Input() trackOverlay: TrackLocationHelperParameters;
  @Input() trackChildren: TrackChildrenParameters;

  constructor(public element: ElementRef<HTMLElement>) {}

  ngOnInit() {
    let locationTrackingAttributes: TrackLocationReturnValue;
    let childrenTrackingAttributes: TrackChildrenReturnValue;

    // Location Trackers
    if (this.trackButton) {
      locationTrackingAttributes = trackButton(this.trackButton);
    } else if (this.trackElement) {
      locationTrackingAttributes = trackElement(this.trackElement);
    } else if (this.trackExpandableElement) {
      locationTrackingAttributes = trackExpandableElement(this.trackExpandableElement);
    } else if (this.trackInput) {
      locationTrackingAttributes = trackInput(this.trackInput);
    } else if (this.trackLink) {
      locationTrackingAttributes = trackLink(this.trackLink);
    } else if (this.trackMediaPlayer) {
      locationTrackingAttributes = trackMediaPlayer(this.trackMediaPlayer);
    } else if (this.trackNavigation) {
      locationTrackingAttributes = trackNavigation(this.trackNavigation);
    } else if (this.trackOverlay) {
      locationTrackingAttributes = trackOverlay(this.trackOverlay);
    }

    // Children Tracker
    if (this.trackChildren) {
      childrenTrackingAttributes = trackChildren(this.trackChildren);
    }

    // Merge Location Tracking attributes and Children Tracking Attributes
    const trackingAttributes = { ...(locationTrackingAttributes ?? {}), ...(childrenTrackingAttributes ?? {}) };

    // Set all attributes on the nativeElement
    for (let [key, value] of Object.entries<string>(trackingAttributes)) {
      this.element.nativeElement.setAttribute(key, value);
    }
  }
}
