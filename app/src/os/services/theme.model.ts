import { Instance, types, applySnapshot } from 'mobx-state-tree';

export const DEFAULT_WALLPAPER =
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100';

export const ThemeModel = types
  .model('ThemeModel', {
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
    setTheme(theme: any) {
      applySnapshot(self, theme);
    },
  }));

export type ThemeModelType = Instance<typeof ThemeModel>;
