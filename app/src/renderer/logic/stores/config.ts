import { types, Instance } from 'mobx-state-tree';

export const WindowThemeModel = types.model({
  backgroundColor: types.optional(types.string, '#FFFFFF'),
  textTheme: types.optional(types.enumeration(['light', 'dark']), 'dark'),
  textColor: types.optional(types.string, 'text.primary'),
});
export type WindowThemeType = Instance<typeof WindowThemeModel>;

export const ConfigStore = types
  .model({
    firstTime: types.optional(types.boolean, true),
    theme: types.optional(types.enumeration(['light', 'dark']), 'light'),
    windowTheme: types.optional(WindowThemeModel, {
      backgroundColor: '#FFFFFF',
      textTheme: 'dark',
      textColor: 'text.primary',
    }),
  })
  .views((self) => ({
    get isFirstTime() {
      return self.firstTime;
    },
  }))
  .actions((self) => ({
    setFirstTime() {
      self.firstTime = false;
    },
    setWindowTheme(windowTheme: WindowThemeType) {
      self.windowTheme = windowTheme;
    },
  }));

export type ConfigStoreType = Instance<typeof ConfigStore>;
