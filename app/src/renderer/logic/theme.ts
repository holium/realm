import { DesktopActions } from './actions/desktop';
import { average } from 'color.js';
import {
  types,
  flow,
  Instance,
  applySnapshot,
  getSnapshot,
  SnapshotOut,
} from 'mobx-state-tree';
import { darken, lighten, rgba } from 'polished';
import { bgIsLightOrDark, toRgbaString } from '../../os/lib/color';
import { LoaderModel } from '../../os/services/common.model';
import { toJS } from 'mobx';
import { defaultTheme as dt } from '@holium/shared';

export const genCSSVariables = (theme: ThemeType) => {
  /**
   * All --rlm-*-rgba variables should be in rgba format.
   * This is to allow for opacity to be applied to the color.
   */
  const themeMode = theme.mode;
  const isLight = themeMode === 'light';
  const homeButtonColor = isLight
    ? toRgbaString(rgba(darken(0.2, theme.dockColor), 0.5))
    : toRgbaString(rgba(darken(0.15, theme.dockColor), 0.6));
  const baseColor = toRgbaString(theme.backgroundColor);
  const accentColor = toRgbaString(theme.accentColor);
  const inputColor = toRgbaString(theme.inputColor);
  const borderColor = isLight
    ? toRgbaString(darken(0.1, theme.windowColor))
    : toRgbaString(darken(0.075, theme.windowColor));
  const windowColor = toRgbaString(theme.windowColor);
  const windowBgColor = toRgbaString(rgba(theme.windowColor, 0.9));
  const dockColor = toRgbaString(rgba(theme.windowColor, 0.65));
  const cardColor = isLight
    ? toRgbaString(lighten(0.05, theme.windowColor))
    : toRgbaString(darken(0.025, theme.windowColor));
  const textColor = toRgbaString(theme.textColor);
  const iconColor = toRgbaString(rgba(theme.textColor, 0.7));
  const mouseColor = toRgbaString(theme.mouseColor);
  const realmBrandColor = toRgbaString('#F08735');
  const intentAlertColor = toRgbaString('#ff6240');
  const intentCautionColor = toRgbaString('#ffbc32');
  const intentSuccessColor = toRgbaString('#0fc383');
  const overlayHoverColor = isLight ? '0, 0, 0, 0.04' : '255, 255, 255, 0.06';
  const overlayActiveColor = isLight ? '0, 0, 0, 0.06' : '255, 255, 255, 0.09';

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

      --rlm-home-button-rgba: ${homeButtonColor};
      --rlm-dock-rgba: ${dockColor};
      --rlm-base-rgba: ${baseColor};
      --rlm-accent-rgba: ${accentColor};
      --rlm-input-rgba: ${inputColor};
      --rlm-border-rgba: ${borderColor};
      --rlm-window-rgba: ${windowColor};
      --rlm-window-bg-rgba: ${windowBgColor};
      --rlm-card-rgba: ${cardColor};
      --rlm-text-rgba: ${textColor};
      --rlm-icon-rgba: ${iconColor};
      --rlm-mouse-rgba: ${mouseColor};
      --rlm-brand-rgba: ${realmBrandColor};
      --rlm-intent-alert-rgba: ${intentAlertColor};
      --rlm-intent-caution-rgba: ${intentCautionColor};
      --rlm-intent-success-rgba: ${intentSuccessColor};
      --rlm-overlay-hover-rgba: ${overlayHoverColor};
      --rlm-overlay-active-rgba: ${overlayActiveColor};
    }
  `;
};

const generateColors = (baseColor: string, bgLuminosity: 'light' | 'dark') => {
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

export const Theme = types
  .model('Theme', {
    id: types.identifier,
    mode: types.optional(types.enumeration(['light', 'dark']), dt.mode),
    backgroundColor: types.optional(types.string, dt.backgroundColor),
    accentColor: types.optional(types.string, dt.accentColor),
    inputColor: types.optional(types.string, dt.inputColor),
    dockColor: types.optional(types.string, dt.dockColor),
    iconColor: types.optional(types.string, dt.iconColor),
    textColor: types.optional(types.string, dt.textColor),
    windowColor: types.optional(types.string, dt.windowColor),
    wallpaper: types.optional(types.string, dt.wallpaper),
    mouseColor: types.optional(types.string, dt.mouseColor),
  })
  .views((self) => ({
    get values() {
      return {
        id: self.id,
        backgroundColor: self.backgroundColor,
        accentColor: self.accentColor,
        inputColor: self.inputColor,
        dockColor: self.dockColor,
        windowColor: self.windowColor,
        mode: self.mode,
        textColor: self.textColor,
        iconColor: self.iconColor,
        mouseColor: self.mouseColor,
        wallpaper: self.wallpaper,
      };
    },
  }))
  .actions((self) => ({
    setMouseColor(color: string) {
      self.mouseColor = color;
    },
    setAccentColor(color: string) {
      self.accentColor = color;
    },
    setWallpaper(path: string, color: string, wallpaper: string) {
      const bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      const theme = Theme.create({
        id: path,
        ...windowTheme,
        wallpaper,
      });
      applySnapshot(self, getSnapshot(theme));
      return self;
    },
  }));

export type ThemeType = Instance<typeof Theme>;
export type ThemeSnapshotType = SnapshotOut<typeof Theme>;

export const ThemeStore = types
  .model({
    loader: types.optional(LoaderModel, { state: 'initial' }),
    currentTheme: types.reference(Theme),
    themes: types.map(Theme),
    // ships: types.map(Theme),
    // spaces: types.map(Theme),
  })
  .views((self) => ({
    get theme() {
      return self.currentTheme;
    },
  }))
  .actions((self) => ({
    setCurrentTheme: (theme: ThemeType) => {
      self.themes.set(theme.id, theme);
      self.currentTheme = Theme.create(theme);
      return self.currentTheme;
    },
    // setCurrentSpaceTheme(spaceId: string,theme?: ThemeType) {
    //   if (theme) {
    //     self.spaces.set(spaceId,theme);
    //   }
    //   self.currentTheme = self.spaces.get(spaceId);
    //   return self.currentTheme;
    // },
    setWallpaper: flow(function* (id: string, wallpaper: string) {
      // console.log(themeId);
      const color = yield average(wallpaper, { group: 10, format: 'hex' });
      const bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      const theme = Theme.create({
        id,
        ...windowTheme,
        wallpaper,
      });
      self.themes.set(id, theme);
      self.currentTheme = theme;
      yield DesktopActions.changeWallpaper(id, toJS(theme));
      return self.currentTheme;
      //   // if (config.patp) {
      //   //   self.ships.set(themeId,theme);
      //   //   self.currentTheme = self.ships.get(themeId);
      //   // }
      //   // if (config.spaceId) {
      //   //   self.spaces.set(themeId,theme);
      //   //   self.currentTheme = self.ships.get(themeId);
      //   // }
    }),
  }));

export type ThemeStoreType = Instance<typeof ThemeStore>;
