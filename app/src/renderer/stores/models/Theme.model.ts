import { Instance, types, applySnapshot, getSnapshot } from 'mobx-state-tree';
import { bgIsLightOrDark } from '@holium/design-system';
import { darken, lighten, rgba } from 'polished';

export const defaultTheme = {
  mode: 'light',
  backgroundColor: '#C4C3BF',
  accentColor: '#4E9EFD',
  inputColor: '#FFFFFF',
  dockColor: '#FFFFFF',
  iconColor: '#CECECC',
  textColor: '#333333',
  windowColor: '#FFFFFF',
  wallpaper:
    'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100',
  mouseColor: '#4E9EFD',
};

export const Theme = types
  .model('Theme', {
    mode: types.optional(
      types.enumeration(['light', 'dark']),
      defaultTheme.mode
    ),
    backgroundColor: types.optional(types.string, defaultTheme.backgroundColor),
    accentColor: types.optional(types.string, defaultTheme.accentColor),
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
