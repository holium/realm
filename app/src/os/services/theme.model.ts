import { Instance, types, applySnapshot } from 'mobx-state-tree';
import { defaultTheme as dt } from '@holium/shared';

export const ThemeModel = types
  .model('ThemeModel', {
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
  .actions((self) => ({
    setTheme(theme: any) {
      applySnapshot(self, theme);
    },
  }));

export type ThemeModelType = Instance<typeof ThemeModel>;
