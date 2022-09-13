// import { osState, shipState } from './../store';
import { types, Instance } from 'mobx-state-tree';

export const ShellStore = types
  .model('ShellStore', {
    isBlurred: types.optional(types.boolean, true),
    isDoubleBlurred: types.optional(types.boolean, false),
    checkDouble: types.optional(types.boolean, false),
    isFullscreen: types.optional(types.boolean, true),
    isMouseInWebview: types.optional(types.boolean, false),
    desktopDimensions: types.optional(
      types.model({
        width: types.number,
        height: types.number,
      }),
      { width: 0, height: 0 }
    ),
    dialogId: types.maybe(types.string),
  })
  .actions((self) => ({
    openDialog(dialogId: string) {
      self.dialogId = dialogId;
    },
    closeDialog() {
      self.dialogId = undefined;
    },
    setDesktopDimensions(width: number, height: number) {
      self.desktopDimensions = {
        width,
        height,
      };
    },
    setIsBlurred(isBlurred: boolean, checkDouble: boolean) {
      let toggled = false;
      if (checkDouble && !self.checkDouble) {
        self.checkDouble = !self.checkDouble;
        toggled = true;
      }
      if (self.checkDouble) {
        if (self.isBlurred && isBlurred)
          self.isDoubleBlurred = true;
        else if (self.isDoubleBlurred && !isBlurred) {
          self.isDoubleBlurred = false;
          if (checkDouble && !toggled) {
            self.checkDouble = !self.checkDouble;
          }
          return;
        }
      }
      if (checkDouble && !toggled) {
        self.checkDouble = !self.checkDouble;
      }
      self.isBlurred = isBlurred;
    },
    setFullscreen(isFullscreen: boolean) {
      self.isFullscreen = isFullscreen;
    },
    setIsMouseInWebview(inWebview: boolean) {
      self.isMouseInWebview = inWebview;
    },
  }));
export type ShellStoreType = Instance<typeof ShellStore>;
