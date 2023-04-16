import { darken, lighten, rgba } from 'polished';
import { ThemeType } from 'renderer/stores/models/theme.model';
import { toRgbaString } from '@holium/design-system';

export const genCSSVariables = (theme: ThemeType) => {
  /**
   * NOTE: app developers depend on these, change with care.
   *
   * All --rlm-*-rgba variables should be in rgba format.
   * All --rlm-*-color variables should be in hex format.
   *
   * The rgba vars allow for opacity to be applied dynamically.
   */
  const themeMode = theme.mode;
  const isLight = themeMode === 'light';
  const homeButtonColor = isLight
    ? rgba(darken(0.2, theme.dockColor), 0.5)
    : rgba(darken(0.15, theme.dockColor), 0.6);
  const baseColor = theme.backgroundColor;
  const accentColor = theme.accentColor;
  const inputColor = theme.inputColor;
  const borderColor = isLight
    ? darken(0.1, theme.windowColor)
    : darken(0.075, theme.windowColor);
  const windowColor = theme.windowColor;
  const windowBgColor = rgba(theme.windowColor, 0.9);
  const dockColor = rgba(theme.windowColor, 0.65);
  const cardColor = isLight
    ? lighten(0.05, theme.windowColor)
    : darken(0.025, theme.windowColor);
  const textColor = theme.textColor;
  const iconColor = rgba(theme.textColor, 0.7);
  const mouseColor = theme.mouseColor;
  const realmBrandColor = '#F08735';
  const intentAlertColor = '#ff6240';
  const intentCautionColor = '#ffbc32';
  const intentSuccessColor = '#0fc383';
  const overlayHoverColor = isLight
    ? rgba({ red: 0, green: 0, blue: 0, alpha: 0.04 })
    : rgba({ red: 255, green: 255, blue: 255, alpha: 0.06 });
  const overlayActiveColor = isLight
    ? rgba({ red: 0, green: 0, blue: 0, alpha: 0.06 })
    : rgba({ red: 255, green: 255, blue: 255, alpha: 0.09 });

  const homeButtonRgba = toRgbaString(homeButtonColor);
  const baseRgba = toRgbaString(baseColor);
  const accentRgba = toRgbaString(accentColor);
  const inputRgba = toRgbaString(inputColor);
  const borderRgba = toRgbaString(borderColor);
  const windowRgba = toRgbaString(windowColor);
  const windowBgRgba = toRgbaString(windowBgColor);
  const dockRgba = toRgbaString(dockColor);
  const cardRgba = toRgbaString(cardColor);
  const textRgba = toRgbaString(textColor);
  const iconRgba = toRgbaString(iconColor);
  const mouseRgba = toRgbaString(mouseColor);
  const realmBrandRgba = toRgbaString(realmBrandColor);
  const intentAlertRgba = toRgbaString(intentAlertColor);
  const intentCautionRgba = toRgbaString(intentCautionColor);
  const intentSuccessRgba = toRgbaString(intentSuccessColor);
  const overlayHoverRgba = toRgbaString(overlayHoverColor);
  const overlayActiveRgba = toRgbaString(overlayActiveColor);

  return `
    :root {
      --theme-mode: ${themeMode};
      --rlm-font: 'Rubik', sans-serif;
      --blur: blur(24px);
      --transition-fast: 0.4s ease;
      --transition: all 0.25s ease;
      --transition-2x: all 0.5s ease;
      --rlm-border-radius-4: 4px;
      --rlm-border-radius-6: 6px;
      --rlm-border-radius-9: 9px;
      --rlm-border-radius-12: 12px;
      --rlm-border-radius-16: 16px;
      --rlm-box-shadow-1: 0px 0px 4px rgba(0, 0, 0, 0.06);
      --rlm-box-shadow-2: 0px 0px 9px rgba(0, 0, 0, 0.12);
      --rlm-box-shadow-3: 0px 0px 9px rgba(0, 0, 0, 0.18);
      --rlm-box-shadow-lifted: 0px 0px 9px rgba(0, 0, 0, 0.24);

      /* rgba vars */
      --rlm-home-button-rgba: ${homeButtonRgba};
      --rlm-dock-rgba: ${dockRgba};
      --rlm-base-rgba: ${baseRgba};
      --rlm-accent-rgba: ${accentRgba};
      --rlm-input-rgba: ${inputRgba};
      --rlm-border-rgba: ${borderRgba};
      --rlm-window-rgba: ${windowRgba};
      --rlm-window-bg-rgba: ${windowBgRgba};
      --rlm-card-rgba: ${cardRgba};
      --rlm-text-rgba: ${textRgba};
      --rlm-icon-rgba: ${iconRgba};
      --rlm-mouse-rgba: ${mouseRgba};
      --rlm-brand-rgba: ${realmBrandRgba};
      --rlm-intent-alert-rgba: ${intentAlertRgba};
      --rlm-intent-caution-rgba: ${intentCautionRgba};
      --rlm-intent-success-rgba: ${intentSuccessRgba};
      --rlm-overlay-hover-rgba: ${overlayHoverRgba};
      --rlm-overlay-active-rgba: ${overlayActiveRgba};

      /* hex vars */
      --rlm-home-button-color: ${homeButtonColor};
      --rlm-dock-color: ${dockColor};
      --rlm-base-color: ${baseColor};
      --rlm-accent-color: ${accentColor};
      --rlm-input-color: ${inputColor};
      --rlm-border-color: ${borderColor};
      --rlm-window-color: ${windowColor};
      --rlm-window-bg-color: ${windowBgColor};
      --rlm-card-color: ${cardColor};
      --rlm-text-color: ${textColor};
      --rlm-icon-color: ${iconColor};
      --rlm-mouse-color: ${mouseColor};
      --rlm-brand-color: ${realmBrandColor};
      --rlm-intent-alert-color: ${intentAlertColor};
      --rlm-intent-caution-color: ${intentCautionColor};
      --rlm-intent-success-color: ${intentSuccessColor};
      --rlm-overlay-hover-color: ${overlayHoverColor};
      --rlm-overlay-active-color: ${overlayActiveColor};
    }
  `;
};

export const generateColors = (
  baseColor: string,
  bgLuminosity: 'light' | 'dark'
) => {
  const windowColor =
    bgLuminosity === 'dark' ? darken(0.05, baseColor) : lighten(0.3, baseColor);
  return {
    // TODO add window border color
    mode: bgLuminosity,
    backgroundColor: baseColor,
    inputColor:
      bgLuminosity === 'dark'
        ? darken(0.06, windowColor)
        : lighten(0.05, windowColor),
    dockColor:
      bgLuminosity === 'dark'
        ? lighten(0.05, baseColor)
        : lighten(0.4, baseColor),
    windowColor,
    textColor:
      bgLuminosity === 'dark'
        ? lighten(0.9, baseColor)
        : darken(0.8, baseColor),
    iconColor:
      bgLuminosity === 'dark'
        ? rgba(lighten(0.5, baseColor), 0.4)
        : rgba(darken(0.4, baseColor), 0.3),
  };
};
