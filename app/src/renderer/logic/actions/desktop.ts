// const colors = ['#005050', '#000000', '#505050', '#000050', '#a05050'];
// ['#005050', '#000000']
// ['#f0a0a0', '#a0a0a0', '#a0f0f0', '#f0f0f0', '#f0f0a0']

import { AppWindowProps, AppWindowType } from 'os/services/shell/desktop.model';
import { AppType } from 'os/services/spaces/models/bazaar';
import { Bounds } from 'os/types';
import { SpacesActions } from './spaces';

/**
 * DesktopActions for interfacing with core process
 */
export const DesktopActions = {
  changeWallpaper: async (spacePath: string, theme: any) => {
    // Need to do this on the client side will not work in node
    // const color = await average(wallpaper, { group: 10, format: 'hex' });
    // const accent = await prominent(wallpaper, {
    //   amount: 2,
    //   group: 80,
    //   sample: 80,
    //   format: 'hex',
    // });
    return await window.electron.os.desktop.changeWallpaper(spacePath, theme);
  },
  setActive: async (appId: string) => {
    return await window.electron.os.desktop.setActive(appId);
  },
  openHomePane: async () => {
    return await window.electron.os.desktop.openHomePane();
  },
  closeHomePane: async () => {
    return await window.electron.os.desktop.closeHomePane();
  },
  setMouseColor: async (mouseColor: string) => {
    window.electron.app.mouseColorChanged(mouseColor);
    await window.electron.os.desktop.setMouseColor(mouseColor);
  },
  setWindowBounds: (appId: string, bounds: Bounds) => {
    window.electron.os.desktop.setWindowBounds(appId, bounds);
  },
  setPartitionCookies: async (partition: string, cookies: any) => {
    return await window.electron.app.setPartitionCookies(partition, cookies);
  },
  openAppWindow: async (app: AppType) => {
    const result = await window.electron.os.desktop.openAppWindow(app);
    // dont add recent apps unitl they are open
    SpacesActions.addRecentApp(app.id);
    return result;
  },
  openDialog: (windowProps: AppWindowProps): Promise<AppWindowType> => {
    return window.electron.os.desktop.openDialog(windowProps);
  },
  toggleMinimized: (appId: string) => {
    return window.electron.os.desktop.toggleMinimized(appId);
  },
  toggleMaximized: (appId: string): Promise<Bounds> => {
    return window.electron.os.desktop.toggleMaximized(appId);
  },
  closeAppWindow: (appId: string) => {
    return window.electron.os.desktop.closeAppWindow(appId);
  },
  toggleDevTools: () => {
    return window.electron.app.toggleDevTools();
  },
  enableIsolationMode: () => {
    return window.electron.app.enableIsolationMode();
  },
  disableIsolationMode: () => {
    return window.electron.app.disableIsolationMode();
  },
  getReleaseChannel: (): Promise<string> => {
    return window.electron.os.desktop.getReleaseChannel();
  },
  setReleaseChannel: (channel: string) => {
    return window.electron.os.desktop.setReleaseChannel(channel);
  },
};

// TODO
// import { DesktopService } from 'os/services/shell/desktop.service';
// import { average, prominent } from 'color.js';

// /**
//  * SpacesActions for interfacing with core process
//  */
// type DesktopActionType = typeof DesktopService.preload;
// export const DesktopActions: DesktopActionType = {
//   ...window.electron.os.spaces,
//   changeWallpaper: async (
//     spacePath: string,
//     wallpaper: string,
//     color?: string
//   ) => {
//     // Need to do this on the client side will not work in node
//     const detectedColor = await average(wallpaper, {
//       group: 10,
//       format: 'hex',
//     });
//     const accent = await prominent(wallpaper, {
//       amount: 2,
//       group: 80,
//       sample: 80,
//       format: 'hex',
//     });
//     console.log(accent);
//     return await window.electron.os.desktop.changeWallpaper(
//       spacePath,
//       wallpaper,
//       detectedColor.toString()
//     );
//   },
// };
