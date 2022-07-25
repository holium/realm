import { average, prominent } from 'color.js';
// const colors = ['#005050', '#000000', '#505050', '#000050', '#a05050'];
// ['#005050', '#000000']
// ['#f0a0a0', '#a0a0a0', '#a0f0f0', '#f0f0f0', '#f0f0a0']
/**
 * DesktopActions for interfacing with core process
 */
export const DesktopActions = {
  changeWallpaper: async (spacePath: string, wallpaper: string) => {
    // Need to do this on the client side will not work in node
    const color = await average(wallpaper, { group: 10, format: 'hex' });
    const accent = await prominent(wallpaper, {
      amount: 2,
      group: 80,
      sample: 80,
      format: 'hex',
    });
    console.log(accent);
    return await window.electron.os.shell.changeWallpaper(
      spacePath,
      color.toString(),
      wallpaper
    );
  },
  setActive: async (spacePath: string, app: any) => {
    return await window.electron.os.shell.setActive(spacePath, app);
  },
  setBlur: async (blurred: boolean) => {
    return await window.electron.os.shell.setBlur(blurred);
  },
  setHomePane: async (isHome: boolean) => {
    return await window.electron.os.shell.setHomePane(isHome);
  },
  setMouseColor: async (mouseColor: string) => {
    return await window.electron.os.shell.setMouseColor(mouseColor);
  },
  setAppDimensions: async (
    windowId: any,
    dimensions: { width: number; height: number; x: number; y: number }
  ) => {
    return await window.electron.os.shell.setAppDimensions(
      windowId,
      dimensions
    );
  },
  setDesktopDimensions: async (width: number, height: number) => {
    return await window.electron.os.shell.setDesktopDimensions(width, height);
  },
  setPartitionCookies: (partition: string, cookies: any) => {
    return window.electron.app.setPartitionCookies(partition, cookies);
  },
  openAppWindow: async (spacePath: string, app: any) => {
    return await window.electron.os.shell.openAppWindow(spacePath, app);
  },
  closeAppWindow: async (spacePath: string, app: any) => {
    return await window.electron.os.shell.closeAppWindow(spacePath, app);
  },
  toggleDevTools: async () => {
    return window.electron.app.toggleDevTools();
  },
  openDialog: async (dialogId: string) => {
    return await window.electron.os.shell.openDialog(dialogId);
  },
  previousDialog: async (dialogId: string) => {
    return await window.electron.os.shell.previousDialog(dialogId);
  },
  nextDialog: async (dialogId: string) => {
    return await window.electron.os.shell.nextDialog(dialogId);
  },
  closeDialog: async () => {
    return await window.electron.os.shell.closeDialog();
  },
};
