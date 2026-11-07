import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from './theme';

export type IconName =
  | 'wallet'
  | 'tag'
  | 'user'
  | 'eye'
  | 'eyeOff'
  | 'shield'
  | 'arrow'
  | 'pin'
  | 'search'
  | 'sliders'
  | 'coffee'
  | 'food'
  | 'ticket'
  | 'book'
  | 'target'
  | 'pig'
  | 'contactless'
  | 'clock';
const paths: Partial<Record<IconName, string>> = {
  wallet:
    'M20 8V5H5a2 2 0 0 1 0-4h14v4M3 3v16a2 2 0 0 0 2 2h15V8H5M20 12h-6v5h6M16.5 14.5h.01',
  tag: 'M3 3h8l10 10-8 8L3 11Z M7 7h.01',
  user: 'M20 21v-3a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v3Z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z',
  eyeOff:
    'm3 3 18 18M10.5 5.1 12 5c6.5 0 10 7 10 7a22 22 0 0 1-3.2 4.1M6.3 6.3A22 22 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 5.2-1.3M10 10a3 3 0 0 0 4 4',
  shield: 'm12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5Z m-4 9 3 3 5-6',
  arrow: 'M4 12h16m-7-7 7 7-7 7',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z',
  search: 'm16 16 6 6',
  sliders: 'M3 6h8m4 0h6M3 12h2m4 0h12M3 18h12m4 0h2M11 3v6M5 9v6m10 0v6',
  coffee:
    'M3 8h13v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM16 9h2a3 3 0 0 1 0 6h-2M6 2v2m4-2v2m4-2v2M2 23h17',
  food: 'M4 2v7a3 3 0 0 0 6 0V2M7 2v20M19 2c-4 3-4 9 0 10V2Zm0 10v10',
  ticket: 'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 5v2m0 3v2m0 3v2',
  book: 'M4 3h16v18H4ZM8 3v18M4 16h16',
  target: 'M12 1v4m0 14v4M1 12h4m14 0h4',
  pig: 'M4 8 2 9v5h3l2 5h3v-3h5v3h3l1-6 3-2V7h-3l-2-4-3 3H9a5 5 0 0 0-5 2ZM9 7h4m4 2h.01',
  contactless: 'M5 9a5 5 0 0 1 0 6m4-9a10 10 0 0 1 0 12m4-15a15 15 0 0 1 0 18',
  clock: 'M12 8v5l3 2M9 2h6m-3 0v3',
};

export function Icon({
  name,
  size = 24,
  color = colors.primary,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {paths[name] && <Path d={paths[name]} />}
      {name === 'user' && <Circle cx="12" cy="6" r="4" />}
      {name === 'eye' && <Circle cx="12" cy="12" r="3" />}
      {name === 'pin' && <Circle cx="12" cy="10" r="2.5" />}
      {name === 'search' && <Circle cx="10" cy="10" r="7" />}
      {name === 'target' && (
        <>
          <Circle cx="12" cy="12" r="8" />
          <Circle cx="12" cy="12" r="3" />
        </>
      )}
      {name === 'clock' && <Circle cx="12" cy="14" r="8" />}
    </Svg>
  );
}

export function CardChip() {
  return (
    <Svg width={44} height={34} viewBox="0 0 44 34" accessible={false}>
      <Rect
        x="1"
        y="1"
        width="42"
        height="32"
        rx="7"
        fill="#E9CC5B"
        stroke="#C8A83E"
      />
      <Rect
        x="9"
        y="7"
        width="26"
        height="20"
        rx="3"
        fill="#EED773"
        stroke="#B99C3D"
      />
    </Svg>
  );
}
