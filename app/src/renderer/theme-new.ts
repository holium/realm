import { lighten, darken, rgba } from 'polished';

const fontSizes = [10, 12, 14, 16, 20, 24, 32, 48];
// aliases
const fontScale = {
  hint: fontSizes[0],
  body: fontSizes[2],
  display: fontSizes[5],
};

const theme = {
  light: {
    fontSizes,
    fontScale,
    colors: {
      brand: {
        primary: '#4E9EFD',
        secondary: '#EF9134',
        neutral: '#F3F3F3',
        accent: '#DB7C00',
        muted: rgba('#4E9EFD', 0.2),
      },
      monochrome: {
        '100': '#000000',
        '90': '#1A1A1A',
        '80': '#333333', // primary text
        '70': '#4C4C4C',
        '60': '#666666', // secondary text
        '50': '#808080',
        '40': '#999999', // tertiary text
        '30': '#B3B3B3',
        '20': '#CCCCCC',
        '10': '#E5E5E5',
        '04': '#F5F5F5',
        '0': '#FFFFFF', // primary background
      },
      intent: {
        info: '#97A3B2',
        success: '#0FC383',
        caution: '#FFBC32',
        alert: '#FF6240',
      },
    },
  },
  dark: {
    fontSizes,
  },
};

export type ThemeType = typeof theme.light;

export default theme;
