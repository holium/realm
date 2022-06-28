/**
 * DesktopActions for interfacing with core process
 */
export const DesktopActions = {
  openAppWindow: async (spacePath: string, app: any) => {
    return await window.electron.os.shell.openAppWindow(spacePath, app);
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

  closeAppWindow: async (spacePath: string, app: any) => {
    return await window.electron.os.shell.closeAppWindow(spacePath, app);
  },

  toggleDevTools: async () => {
    return window.electron.app.toggleDevTools();
  },
};
