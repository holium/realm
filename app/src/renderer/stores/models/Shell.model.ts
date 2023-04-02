// import { osState, shipState } from './../store';
import { types, Instance, getSnapshot, applySnapshot } from 'mobx-state-tree';
import { RealmActions } from 'renderer/logic/actions/main';

export const ShellModel = types
  .model('ShellModel', {
    isBlurred: types.optional(types.boolean, true),
    isFullscreen: types.optional(types.boolean, true),
    desktopDimensions: types.optional(
      types.model({
        width: types.number,
        height: types.number,
      }),
      { width: 0, height: 0 }
    ),
    dialogId: types.maybe(types.string),
    dialogProps: types.map(types.string),
    mouseColor: types.optional(types.string, '#4E9EFD'),
    homePaneOpen: types.optional(types.boolean, false),
    isolationMode: types.optional(types.boolean, false),
    micAllowed: types.optional(types.boolean, false),
    multiplayerEnabled: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get isHomePaneOpen() {
      return self.homePaneOpen;
    },
    get isIsolationMode() {
      return self.isolationMode;
    },
  }))
  .actions((self) => ({
    openDialog(dialogId: string) {
      self.dialogId = dialogId;
    },
    openDialogWithStringProps(dialogId: string, props: any) {
      self.dialogId = dialogId;
      applySnapshot(
        self.dialogProps,
        getSnapshot(types.map(types.string).create(props))
      );
    },
    setMouseColor: async (mouseColor: string) => {
      window.electron.app.setMouseColor(mouseColor);
      self.mouseColor = mouseColor;
    },
    closeDialog() {
      self.dialogId = undefined;
    },
    enableIsolationMode: () => {
      return window.electron.app.enableIsolationMode();
    },
    disableIsolationMode: () => {
      return window.electron.app.disableIsolationMode();
    },
    setDesktopDimensions(width: number, height: number) {
      self.desktopDimensions = {
        width,
        height,
      };
    },
    setIsBlurred(isBlurred: boolean) {
      self.isBlurred = isBlurred;
    },
    setFullscreen(isFullscreen: boolean) {
      self.isFullscreen = isFullscreen;
    },
  }));

export type ShellModelType = Instance<typeof ShellModel>;
