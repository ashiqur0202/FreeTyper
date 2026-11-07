import type { Device } from './mouseData';
import { STEPS } from './mouseData';
import { DRILLS, type DrillProps } from './drills';
import { SmallTargetsDrill, PreciseDragDrill, HoldDrill, SelectDrill, FindDrill } from './drills2';
import { MovingDrill, SteerDrill, QuickDrill, MenuDrill, SortDrill } from './drills3';
import { GauntletDrill, ShrinkDrill, TinyTargetsDrill } from './drills4';
import { LEVEL_ITEMS, PASS, type LevelId } from './levelRules';

// The four levels: title, wording for each device, and the drill component for every item.

export type CourseItem = {
  id: string;
  title: string;
  text: Record<Device, string>;
  Drill: (p: DrillProps) => React.JSX.Element;
};

const level1: CourseItem[] = STEPS.map((s) => ({ id: s.id, title: s.title, text: s.text, Drill: DRILLS[s.id] }));

const level2: CourseItem[] = [
  {
    id: 'small',
    title: 'Small targets',
    text: {
      mouse: `Click 10 small circles. Aim for the middle. You need ${PASS.small}% of your clicks to hit.`,
      trackpad: `Slide to each small circle, then tap or press. 10 circles. You need ${PASS.small}% of your taps to hit.`,
    },
    Drill: SmallTargetsDrill,
  },
  {
    id: 'precise',
    title: 'Precise drag',
    text: {
      mouse: 'Drag the card until the pointer is on the dashed circle, then let go. Do it three times.',
      trackpad: 'Press and hold, slide until the pointer is on the dashed circle, then let go. Do it three times.',
    },
    Drill: PreciseDragDrill,
  },
  {
    id: 'hold',
    title: 'Click and hold',
    text: {
      mouse: 'Press the left button on the circle and keep it pressed for one second.',
      trackpad: 'Press the pad down on the circle and keep it pressed for one second. Do not lift your finger.',
    },
    Drill: HoldDrill,
  },
  {
    id: 'select',
    title: 'Select text',
    text: {
      mouse: 'Select the highlighted sentence: press at its start, drag to its end and let go. Or click it three times quickly.',
      trackpad: 'Select the highlighted sentence: press and hold at its start, slide to its end and let go. Or tap it three times quickly.',
    },
    Drill: SelectDrill,
  },
  {
    id: 'find',
    title: 'Scroll to find',
    text: {
      mouse: 'Scroll the list with the wheel to find Item 47, then click it.',
      trackpad: 'Scroll the list with two fingers to find Item 47, then tap or press it.',
    },
    Drill: FindDrill,
  },
];

const level3: CourseItem[] = [
  {
    id: 'moving',
    title: 'Moving targets',
    text: {
      mouse: 'Click the drifting circle 8 times. It jumps somewhere new after every hit.',
      trackpad: 'Tap or press the drifting circle 8 times. It jumps somewhere new after every hit.',
    },
    Drill: MovingDrill,
  },
  {
    id: 'steer',
    title: 'Steer along a path',
    text: {
      mouse: `Move the pointer onto the start dot, follow the grey path and stay inside it, then finish on the end dot. No button is needed. You need ${PASS.steer}% inside.`,
      trackpad: `Slide one finger so the pointer is on the start dot, follow the grey path and stay inside it, then finish on the end dot. You need ${PASS.steer}% inside.`,
    },
    Drill: SteerDrill,
  },
  {
    id: 'quick',
    title: 'Quick double-clicks',
    text: {
      mouse: 'Double-click each circle as it appears. Five of them within 20 seconds of your first click.',
      trackpad: 'Double-tap or press twice on each circle as it appears. Five of them within 20 seconds of your first try.',
    },
    Drill: QuickDrill,
  },
  {
    id: 'menu',
    title: 'Use the right-click menu',
    text: {
      mouse: 'Right-click the circle, then choose the item named in the prompt from the menu. Three times.',
      trackpad: 'Two-finger tap (or press the bottom-right corner) on the circle, then choose the item named in the prompt. Three times.',
    },
    Drill: MenuDrill,
  },
  {
    id: 'sort',
    title: 'Put the cards in order',
    text: {
      mouse: 'Drag each numbered card onto the slot with the same number.',
      trackpad: 'Press and hold a card, slide it onto the slot with the same number, then let go.',
    },
    Drill: SortDrill,
  },
];

const level4: CourseItem[] = [
  {
    id: 'gauntlet',
    title: 'The gauntlet',
    text: {
      mouse: `60 seconds. Do what the circle says: click, double-click, right-click, or drag the card into the box. Score ${PASS.gauntlet} or more.`,
      trackpad: `60 seconds. Do what the circle says: tap or press, double-tap, two-finger tap, or drag the card into the box. Score ${PASS.gauntlet} or more.`,
    },
    Drill: GauntletDrill,
  },
  {
    id: 'shrink',
    title: 'Shrinking targets',
    text: {
      mouse: `Hit targets that get smaller with every hit. Score ${PASS.shrink} or more in 30 seconds.`,
      trackpad: `Tap or press targets that get smaller with every hit. Score ${PASS.shrink} or more in 30 seconds.`,
    },
    Drill: ShrinkDrill,
  },
  {
    id: 'tiny',
    title: 'Tiny targets',
    text: {
      mouse: `Click 20 very small circles. You need ${PASS.tiny}% of your clicks to hit.`,
      trackpad: `Tap or press 20 very small circles. You need ${PASS.tiny}% of your taps to hit.`,
    },
    Drill: TinyTargetsDrill,
  },
];

export const COURSE: Record<LevelId, CourseItem[]> = { 1: level1, 2: level2, 3: level3, 4: level4 };

// Guard: the course must list exactly the ids the rules expect, in the same order.
for (const l of [1, 2, 3, 4] as LevelId[]) {
  if (COURSE[l].map((i) => i.id).join() !== LEVEL_ITEMS[l].join()) {
    throw new Error(`Course level ${l} does not match LEVEL_ITEMS`);
  }
}
