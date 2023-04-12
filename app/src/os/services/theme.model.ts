import { Instance, types, applySnapshot } from 'mobx-state-tree';

export const defaultTheme = {
  id: 'default',
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

export const ThemeModel = types
  .model('ThemeModel', {
    id: types.identifier,
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
  .actions((self) => ({
    setTheme(theme: any) {
      applySnapshot(self, theme);
    },
  }));

export type ThemeModelType = Instance<typeof ThemeModel>;
