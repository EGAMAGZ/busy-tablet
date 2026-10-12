import type { JSX } from 'preact';

// Ionic ships web components; Preact needs the custom elements declared.
type IonElement = JSX.HTMLAttributes<HTMLElement> & Record<string, unknown>;

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      'ion-app': IonElement;
      'ion-content': IonElement;
      'ion-page': IonElement;
      'ion-segment': IonElement;
      'ion-segment-button': IonElement;
      'ion-button': IonElement;
      'ion-list': IonElement;
      'ion-item': IonElement;
      'ion-label': IonElement;
      'ion-toggle': IonElement;
    }
  }
}

export {};
