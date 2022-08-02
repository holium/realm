export const ShellActions = {
  setDesktopDimensions: async (width: number, height: number) => {
    return await window.electron.os.shell.setDesktopDimensions(width, height);
  },
  setBlur: async (blurred: boolean) => {
    return await window.electron.os.shell.setBlur(blurred);
  },
  openDialog: async (dialogId: string) => {
    return await window.electron.os.shell.openDialog(dialogId);
  },
  nextDialog: async (dialogId: string) => {
    return await window.electron.os.shell.nextDialog(dialogId);
  },
  closeDialog: async () => {
    return await window.electron.os.shell.closeDialog();
  },
  setIsMouseInWebview: async(isInWebview: boolean) => {
    return await window.electron.os.shell.setIsMouseInWebview(isInWebview);
  }
}
