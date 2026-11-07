// Wording and constants for the Mouse practice page (MouseLearn.tsx, drills.tsx).
// No React here, so the Node test script can load it.

export type Device = 'mouse' | 'trackpad';
export type StepId = 'move' | 'click' | 'double' | 'right' | 'drag' | 'scroll' | 'mixed';

/** A trackpad step still open after this long shows the touchpad-settings hint. */
export const HINT_AFTER_MS = 10000;

export const STEPS: { id: StepId; title: string; text: Record<Device, string> }[] = [
  {
    id: 'move',
    title: 'Move the pointer',
    text: {
      mouse: 'Slide the mouse to move the pointer onto each glowing circle. You do not need to click.',
      trackpad: 'Slide one finger on the pad to move the pointer onto each glowing circle. You do not need to click.',
    },
  },
  {
    id: 'click',
    title: 'Click',
    text: {
      mouse: 'Put the pointer on the circle and press the left button once.',
      trackpad: 'Put the pointer on the circle, then press the pad down or tap it once.',
    },
  },
  {
    id: 'double',
    title: 'Double-click',
    text: {
      mouse: 'Press the left button twice, quickly, without moving the mouse.',
      trackpad: 'Tap the pad twice quickly, or press it twice quickly, without moving your finger.',
    },
  },
  {
    id: 'right',
    title: 'Right-click',
    text: {
      mouse: 'Press the right button once inside the box. A right-click usually opens a menu.',
      trackpad: 'Do a two-finger tap on the pad, or press the bottom-right corner of the pad, inside the box.',
    },
  },
  {
    id: 'drag',
    title: 'Drag and drop',
    text: {
      mouse: 'Press and hold the left button on the card, move the mouse to the box, then let go.',
      trackpad: 'Press and hold on the card, slide to the box, then let go. If your laptop has tap-to-drag, tap, tap again and slide.',
    },
  },
  {
    id: 'scroll',
    title: 'Scroll',
    text: {
      mouse: 'Put the pointer on the list and turn the mouse wheel until you have moved down the list.',
      trackpad: 'Put the pointer on the list and slide two fingers up or down on the pad.',
    },
  },
  {
    id: 'mixed',
    title: 'Put it together',
    text: {
      mouse: 'Do what each prompt asks: click, double-click or right-click the circle.',
      trackpad: 'Do what each prompt asks: tap or press, double-tap, or two-finger tap the circle.',
    },
  },
];
