import { types, flow, Instance, tryReference } from 'mobx-state-tree';
import { sendAction } from '../api/realm.core';
import { darken, lighten, rgba } from 'polished';
import { average } from 'color.js';
import { bgIsLightOrDark } from '../utils/color';

// https://unsplash.com/@pawel_czerwinski
// export const DEFAULT_WALLPAPER =
//   'https://images.unsplash.com/photo-1650361072639-e2d0d4f7f3e6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=100';

export const DEFAULT_WALLPAPER =
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100';

// export const DEFAULT_WALLPAPER =
//   'https://images.unsplash.com/photo-1643916861364-02e63ce3e52f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2870&q=100';

const generateColors = (baseColor: string, bgLuminosity: 'light' | 'dark') => {
  return {
    backgroundColor: baseColor,
    dockColor:
      bgLuminosity === 'dark'
        ? darken(0.2, baseColor)
        : lighten(0.2, baseColor),
    windowColor:
      bgLuminosity === 'dark'
        ? darken(0.2, baseColor)
        : lighten(0.2, baseColor),
    textColor:
      bgLuminosity === 'dark'
        ? lighten(0.9, baseColor)
        : darken(0.6, baseColor),
    textTheme: bgLuminosity,
    iconColor: rgba(darken(0.4, baseColor), 0.5),
  };
};

export const ThemeStore = types
  .model({
    wallpaper: types.string,
    backgroundColor: types.optional(types.string, '#FFFFFF'),
    dockColor: types.optional(types.string, '#FFFFFF'),
    windowColor: types.optional(types.string, '#FFFFFF'),
    textTheme: types.optional(types.enumeration(['light', 'dark']), 'dark'),
    textColor: types.optional(types.string, '#333333'),
    iconColor: types.optional(types.string, '#333333'),
    mouseColor: types.optional(types.string, '#4E9EFD'),
  })
  .actions((self) => ({
    setWallpaper: flow(function* (wallpaper: string) {
      self.wallpaper = wallpaper;
      const color = yield average(wallpaper, { group: 15, format: 'hex' });
      let bgLuminosity = self.textTheme;
      bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      self.backgroundColor = windowTheme.backgroundColor;
      self.dockColor = windowTheme.dockColor;
      self.windowColor = windowTheme.windowColor;
      self.textColor = windowTheme.textColor;
      self.textTheme = windowTheme.textTheme;
      self.iconColor = windowTheme.iconColor;
    }),
    setMouseColor(color: string) {
      self.mouseColor = color;
    },
    setTheme(ship: string, baseColor: string, bgLuminosity: 'light' | 'dark') {
      const windowTheme: any = generateColors(baseColor, bgLuminosity);
      const action = {
        action: 'set-ship-theme',
        resource: 'ship.manager',
        context: {
          ship,
        },
        data: {
          key: 'theme',
          value: windowTheme,
        },
      };
      sendAction(action);
      sendAction({
        action: 'set-ship-theme',
        resource: 'auth.manager',
        context: {
          ship,
        },
        data: {
          key: 'theme',
          value: windowTheme,
        },
      });
    },
  }));

export type ThemeStoreType = Instance<typeof ThemeStore>;
