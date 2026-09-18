import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const HomeIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.182V20a1 1 0 001 1h5v-6h6v6h5a1 1 0 001-1v-9.818a1 1 0 00-.39-.792l-8-6.154a1 1 0 00-1.22 0l-8 6.154A1 1 0 003 10.182z"
      fill={color}
    />
  </Svg>
);

export const DumbbellIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 5v14M18 5v14M2 9v6a1 1 0 001 1h1V8H3a1 1 0 00-1 1zm18-1h1a1 1 0 011 1v6a1 1 0 01-1 1h-1V8zm-14 3h12v2H6v-2z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BarChartIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 20V10M12 20V4M6 20v-6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4a2 2 0 012-2h10a2 2 0 012 2v18l-7-4-7 4V4z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookmarkFilledIcon: React.FC<IconProps> = ({ size = 22, color = '#FA5A47' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4a2 2 0 012-2h10a2 2 0 012 2v18l-7-4-7 4V4z"
      fill={color}
    />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2.2" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#111216' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.2" />
    <Path d="M20 20l-4-4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({ size = 20, color = '#111216' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

export const MoreHorizontalIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="1.8" fill={color} />
    <Circle cx="19" cy="12" r="1.8" fill={color} />
    <Circle cx="5" cy="12" r="1.8" fill={color} />
  </Svg>
);

export const BackArrowIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4l14 8-14 8V4z" fill={color} />
  </Svg>
);

export const TimerIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth="2" />
    <Path d="M12 9v4l2.5 2.5M10 2h4M12 2v3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FlameIcon: React.FC<IconProps> = ({ size = 18, color = '#FA5A47' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2c-.5 2.5-3 5-3 8 0 3.3 2.7 6 6 6s6-2.7 6-6c0-4-3.5-7-4-8.5-.5 1-1 2-2 2-1 0-2-1-3-1.5z"
      fill={color}
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CircleCheckIcon: React.FC<IconProps> = ({ size = 22, color = '#FA5A47' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path
      d="M16 9l-5.5 5.5L8 12"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CircleOutlineIcon: React.FC<IconProps> = ({ size = 22, color = '#71717A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
  </Svg>
);
