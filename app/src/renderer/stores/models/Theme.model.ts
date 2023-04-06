import { Instance, types, applySnapshot, getSnapshot } from 'mobx-state-tree';
import { darken, lighten, rgba } from 'polished';
import { bgIsLightOrDark } from '@holium/design-system';
import { defaultTheme as dt } from 'os/services/theme.model';

export const Theme = types
  .model('Theme', {
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
    setWallpaper(color: string, wallpaper: string) {
      const bgLuminosity = bgIsLightOrDark(color.toString());
      const windowTheme = generateColors(color, bgLuminosity);
      const theme = Theme.create({
        ...windowTheme,
        wallpaper,
      });
      applySnapshot(self, getSnapshot(theme));
      return self;
    },
  }));

export type ThemeType = Instance<typeof Theme>;

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
