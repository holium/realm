import { average } from 'color.js';
import {
  types,
  flow,
  Instance,
  clone,
  tryReference,
  applySnapshot,
} from 'mobx-state-tree';
import { darken, lighten, rgba } from 'polished';
import { bgIsLightOrDark } from '../../lib/color';
import { LoaderModel } from '../common.model';

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
    textTheme: bgLuminosity,
    iconColor:
      bgLuminosity === 'dark'
        ? rgba(lighten(0.5, baseColor), 0.4)
        : rgba(darken(0.4, baseColor), 0.3),
  };
};

export const ThemeModel = types
  .model('ThemeModel', {
    themeId: types.maybe(types.string),
    wallpaper: types.optional(types.string, DEFAULT_WALLPAPER),
    inputColor: types.optional(types.string, '#ffffff'),
    backgroundColor: types.optional(types.string, '#c4c3bf'),
    dockColor: types.optional(types.string, '#f5f5f4'),
    windowColor: types.optional(types.string, '#f5f5f4'),
    textTheme: types.optional(types.enumeration(['light', 'dark']), 'light'),
    mode: types.optional(types.enumeration(['light', 'dark']), 'light'),
    textColor: types.optional(types.string, '#2a2927'),
    iconColor: types.optional(types.string, '#333333'),
    mouseColor: types.optional(types.string, '#4E9EFD'),
  })
  .actions((self) => ({
    setMouseColor(color: string) {
      self.mouseColor = color;
    },
    setWallpaper(path: string, color: string, wallpaper: string) {
      const bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      const theme = ThemeModel.create({
        themeId: path,
        ...windowTheme,
        wallpaper,
      });
      applySnapshot(self, clone(theme));
      return self;
    },
  }));

export type ThemeModelType = Instance<typeof ThemeModel>;

export const ThemeStore = types
  .model({
    loader: types.optional(LoaderModel, { state: 'initial' }),
    currentTheme: types.safeReference(ThemeModel),
    os: types.optional(ThemeModel, {
      themeId: 'os',
      wallpaper: DEFAULT_WALLPAPER,
      backgroundColor: '#c2b4b4',
      dockColor: '#f0ecec',
      windowColor: '#f0ecec',
      textTheme: 'light',
      textColor: '#261f1f',
      iconColor: '#333333',
      mouseColor: '#4E9EFD',
    }),
    ships: types.map(ThemeModel),
    spaces: types.map(ThemeModel),
  })
  .views((self) => ({
    get theme() {
      if (!self.currentTheme) {
        return self.os;
      }
      return self.currentTheme;
    },
  }))
  .actions((self) => ({
    setCurrentShipTheme: (patp: string, theme?: ThemeModelType) => {
      if (theme) {
        self.ships.set(patp, theme);
      }
      self.currentTheme = self.ships.get(patp);
      return self.currentTheme;
    },
    setCurrentSpaceTheme(spaceId: string, theme?: ThemeModelType) {
      if (theme) {
        self.spaces.set(spaceId, theme);
      }
      self.currentTheme = self.spaces.get(spaceId);
      return self.currentTheme;
    },
    setWallpaper: flow(function* (
      wallpaper: string,
      config: { patp?: string; spaceId?: string }
    ) {
      const themeId = (config.patp && `ship${config.patp}`) || config.spaceId;
      // console.log(themeId);
      // const color = yield average(wallpaper, { group: 15, format: 'hex' });
      const color = '#c4c3bf';
      const bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      const theme = ThemeModel.create({
        themeId: themeId!,
        ...windowTheme,
        wallpaper,
      });
      if (config.patp) {
        self.ships.set(themeId!, theme);
        self.currentTheme = self.ships.get(themeId!);
      }
      if (config.spaceId) {
        self.spaces.set(themeId!, theme);
        self.currentTheme = self.ships.get(themeId!);
      }
    }),
  }));

export type ThemeStoreType = Instance<typeof ThemeStore>;
