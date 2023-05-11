import { average } from 'color.js';
import {
  applySnapshot,
  flow,
  getSnapshot,
  Instance,
  types,
} from 'mobx-state-tree';
import { darken, lighten, mix, rgba } from 'polished';

import { bgIsLightOrDark, luminosity } from '@holium/design-system';

import { defaultTheme } from './defaultTheme';

export const Theme = types
  .model('Theme', {
    mode: types.optional(
      types.enumeration(['light', 'dark']),
      defaultTheme.mode
    ),
    backgroundColor: types.optional(types.string, defaultTheme.backgroundColor),
    accentColor: types.optional(types.string, defaultTheme.accentColor),
    offAccentColor: types.optional(types.string, defaultTheme.offAccentColor),
    inputColor: types.optional(types.string, defaultTheme.inputColor),
    dockColor: types.optional(types.string, defaultTheme.dockColor),
    iconColor: types.optional(types.string, defaultTheme.iconColor),
    textColor: types.optional(types.string, defaultTheme.textColor),
    windowColor: types.optional(types.string, defaultTheme.windowColor),
    wallpaper: types.optional(types.string, defaultTheme.wallpaper),
    mouseColor: types.optional(types.string, defaultTheme.mouseColor),
  })
  .views((self) => ({
    get values() {
      return {
        backgroundColor: self.backgroundColor,
        accentColor: self.accentColor,
        offAccentColor: self.offAccentColor,
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
    setWallpaper: flow(function* (wallpaper: string) {
      const color = yield average(wallpaper, { group: 10, format: 'hex' });
      const bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      const theme = Theme.create({
        ...windowTheme,
        wallpaper,
      });
      applySnapshot(self, getSnapshot(theme));
      return self;
    }),
  }));

export type ThemeType = Instance<typeof Theme>;
export type ThemeSnapshotIn = typeof Theme.SnapshotType;

const generateColors = (color: string, bgLuminosity: 'light' | 'dark') => {
  /* Generate base color using semi-intelligent hue / contrast logic.
     This is used as the base for  */
  const genBaseColor = () => {
    const luma = luminosity(color);
    if (bgLuminosity === 'dark') {
      /* 0 - 128 */
      const shift = 64 - luma;
      if (shift > 0) {
        return mix(
          0.25,
          '#000',
          lighten(Math.min(0.0001 * Math.pow(shift, 2), 0.2), color)
        );
      } else {
        return mix(
          0.25,
          '#000',
          darken(Math.min(0.0001 * Math.pow(shift, 2), 0.4), color)
        );
      }
    } else {
      /* 128 - 255 */
      const shift = luma - 192;
      console.log(shift);
      if (shift > 0) {
        return mix(
          0.25,
          '#FFF',
          darken(Math.min(0.0001 * Math.pow(shift, 2), 0.2), color)
        );
      } else {
        return mix(
          0.25,
          '#FFF',
          lighten(Math.min(0.0001 * Math.pow(shift, 2), 0.4), color)
        );
      }
    }
  };

  const baseColor = genBaseColor();

  return {
    // TODO add window border color
    mode: bgLuminosity,
    backgroundColor: baseColor,
    inputColor:
      bgLuminosity === 'dark'
        ? darken(0.11, baseColor)
        : lighten(0.11, baseColor),
    dockColor:
      bgLuminosity === 'dark'
        ? lighten(0.05, baseColor)
        : lighten(0.12, baseColor),
    windowColor:
      bgLuminosity === 'dark'
        ? darken(0.05, baseColor)
        : lighten(0.1, baseColor),
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
