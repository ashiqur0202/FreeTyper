import type { KeyboardEvent } from 'react';
import { keyboardColors } from './typingData';
import { FINGER_NAMES, PLAIN_FINGER, THUMB_COLOR, type FingerName, type Hand } from './guideLayout';

// Two drawn hands for the Keyboard guide. The right hand is the left one mirrored:
// x positions are flipped, the shapes and tilts are reused.

const W = 300;
const FINGERS: { name: FingerName; x: number; height: number; tilt: number }[] = [
  { name: 'pinky', x: 14, height: 86, tilt: -7 },
  { name: 'ring', x: 66, height: 108, tilt: -3 },
  { name: 'middle', x: 118, height: 120, tilt: 0 },
  { name: 'index', x: 170, height: 104, tilt: 5 },
];
const HOME_LEFT = ['A', 'S', 'D', 'F'];
const HOME_RIGHT = ['J', 'K', 'L', ';'];
const FINGER_WIDTH = 44;

type Props = {
  hand: Hand;
  /** Zone to light up ("left-index", "thumb" ...) or null for none. */
  activeZone: string | null;
  onPick: (zone: string) => void;
};

export default function GuideHands({ hand, activeZone, onPick }: Props) {
  const mirrored = hand === 'right';
  const flip = (x: number) => (mirrored ? W - x : x);
  const gradient = (zone: string) => `kg-grad-${zone}`;

  const keyHandler = (zone: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(zone);
    }
  };

  const thumbX = flip(236);
  const thumbOn = activeZone === 'thumb';

  return (
    <svg viewBox={`0 0 ${W} 250`} className="kg-hand" role="group" aria-label={`${hand} hand`}>
      <defs>
        {FINGER_NAMES.map((n) => {
          const zone = `${hand}-${n}`;
          const c = keyboardColors[zone];
          return (
            <linearGradient key={zone} id={gradient(zone)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} />
              <stop offset="1" stopColor={c} stopOpacity=".72" />
            </linearGradient>
          );
        })}
        <linearGradient id={gradient(`${hand}-thumb`)} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={THUMB_COLOR} />
          <stop offset="1" stopColor={THUMB_COLOR} stopOpacity=".7" />
        </linearGradient>
      </defs>

      <rect
        x={10}
        y={132}
        width={W - 70}
        height={96}
        rx={42}
        className="kg-palm"
        transform={mirrored ? `translate(${W} 0) scale(-1 1)` : undefined}
      />

      {FINGERS.map((f, i) => {
        const zone = `${hand}-${f.name}`;
        const on = activeZone === zone;
        const dim = activeZone !== null && !on;
        const cx = flip(f.x + FINGER_WIDTH / 2);
        const top = 140 - f.height;
        const rot = mirrored ? -f.tilt : f.tilt;
        const homeKey = mirrored ? HOME_RIGHT[3 - i] : HOME_LEFT[i];
        const t = `rotate(${rot} ${cx} 140)`;
        return (
          <g
            key={zone}
            className={`kg-fg${on ? ' on' : ''}${dim ? ' dim' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`${hand} ${PLAIN_FINGER[f.name]} finger: show its keys`}
            onClick={() => onPick(zone)}
            onKeyDown={keyHandler(zone)}
          >
            <g className="kg-fr">
              <rect
                x={cx - FINGER_WIDTH / 2}
                y={top}
                width={FINGER_WIDTH}
                height={f.height}
                rx={22}
                fill={`url(#${gradient(zone)})`}
                transform={t}
                stroke={on ? '#fff' : undefined}
                strokeWidth={on ? 3 : undefined}
              />
              <ellipse cx={cx - 6} cy={top + 14} rx={6} ry={9} fill="#fff" opacity={0.22} transform={t} />
              <text x={cx} y={130} textAnchor="middle" className="kg-home-letter" transform={t}>
                {homeKey}
              </text>
            </g>
          </g>
        );
      })}

      <g
        className={`kg-fg${thumbOn ? ' on' : ''}${activeZone !== null && !thumbOn ? ' dim' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={thumbOn}
        aria-label={`${hand} thumb: space bar`}
        onClick={() => onPick('thumb')}
        onKeyDown={keyHandler('thumb')}
      >
        <g className="kg-fr">
          <rect
            x={thumbX - 34}
            y={158}
            width={68}
            height={34}
            rx={17}
            fill={`url(#${gradient(`${hand}-thumb`)})`}
            transform={`rotate(${mirrored ? 28 : -28} ${thumbX} 175)`}
            stroke={thumbOn ? '#fff' : undefined}
            strokeWidth={thumbOn ? 3 : undefined}
          />
        </g>
      </g>

      {FINGERS.map((f) => (
        <text
          key={f.name}
          x={flip(f.x + FINGER_WIDTH / 2)}
          y={248}
          textAnchor="middle"
          className="kg-finger-name"
          fill={keyboardColors[`${hand}-${f.name}`]}
        >
          {PLAIN_FINGER[f.name]}
        </text>
      ))}
      <text x={thumbX} y={248} textAnchor="middle" className="kg-finger-name" fill={THUMB_COLOR}>
        thumb
      </text>
    </svg>
  );
}
