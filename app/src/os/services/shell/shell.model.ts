// import { osState, shipState } from './../store';
import { types, Instance, getSnapshot, applySnapshot } from 'mobx-state-tree';

export const ShellStore = types
  .model('ShellStore', {
    isBlurred: types.optional(types.boolean, true),
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
    dialogProps: types.map(types.string)
  })
  .actions((self) => ({
    openDialog(dialogId: string) {
      self.dialogId = dialogId;
    },
    openDialogWithStringProps(dialogId: string, props: any) {
      self.dialogId = dialogId;
      applySnapshot(self.dialogProps, getSnapshot(types.map(types.string).create(props)));
      console.log('aowiehroiwht', self.dialogProps)
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
    setIsBlurred(isBlurred: boolean) {
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
