import { DesktopActions } from './actions/desktop';
import { average } from 'color.js';
import {
  types,
  flow,
  Instance,
  applySnapshot,
  getSnapshot,
} from 'mobx-state-tree';
import { darken, lighten, rgba } from 'polished';
import { bgIsLightOrDark } from '../../os/lib/color';
import { LoaderModel } from '../../os/services/common.model';
import { toJS } from 'mobx';

export const genCSSVariables = (theme: ThemeType) => {
  // console.log(toJS(theme));
  return `
      * { cursor: none !important; }
      :root {
        --rlm-font: 'Rubik', sans-serif;
        --rlm-base-color: ${theme.backgroundColor};
        --rlm-accent-color: ${theme.accentColor};
        --rlm-input-color: ${theme.inputColor};
        --rlm-border-color: ${
          theme.mode === 'light'
            ? darken(0.1, theme.windowColor)
            : darken(0.075, theme.windowColor)
        };
        --rlm-window-color: ${theme.windowColor};
        --rlm-dock-color: ${rgba(theme.windowColor, 0.75)};
        --rlm-card-color: ${
          theme.mode === 'light'
            ? lighten(0.05, theme.windowColor)
            : darken(0.025, theme.windowColor)
        };
        --rlm-theme-mode: ${theme.mode};
        --rlm-text-color: ${theme.textColor};
        --rlm-icon-color: ${theme.iconColor};
        --rlm-mouse-color: ${theme.mouseColor};
        --rlm-intent-alert-color: #ff6240;
        --rlm-intent-caution-color: #ffbc32;
        --rlm-intent-success-color: #0fc383;
        --rlm-border-radius-4: 4px;
        --rlm-border-radius-6: 6px;
        --rlm-border-radius-9: 9px;
        --rlm-border-radius-12: 12px;
        --rlm-border-radius-12: 16px;
        --rlm-overlay-hover: rgba(0, 0, 0, 0.05);
        --rlm-overlay-active: rgba(0, 0, 0, 0.09);
      }
   
      div[data-radix-portal] {
        z-index: 2000 !important;
      }
    `;
};

export const DEFAULT_WALLPAPER =
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100';

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
    backgroundColor: types.optional(types.string, '#c4c3bf'),
    accentColor: types.optional(types.string, '#4E9EFD'),
    inputColor: types.optional(types.string, '#FFFFFF'),
    dockColor: types.optional(types.string, '#F5F5F4'),
    windowColor: types.optional(types.string, '#f5f5f4'),
    mode: types.optional(types.enumeration(['light', 'dark']), 'light'),
    textColor: types.optional(types.string, '#2a2927'),
    iconColor: types.optional(types.string, '#333333'),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    wallpaper: types.optional(types.string, DEFAULT_WALLPAPER),
  })
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
    // setCurrentSpaceTheme(spaceId: string, theme?: ThemeType) {
    //   if (theme) {
    //     self.spaces.set(spaceId, theme);
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
      //   //   self.ships.set(themeId!, theme);
      //   //   self.currentTheme = self.ships.get(themeId!);
      //   // }
      //   // if (config.spaceId) {
      //   //   self.spaces.set(themeId!, theme);
      //   //   self.currentTheme = self.ships.get(themeId!);
      //   // }
    }),
  }));

export type ThemeStoreType = Instance<typeof ThemeStore>;
