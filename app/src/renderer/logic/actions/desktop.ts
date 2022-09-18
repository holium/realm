import { average, prominent } from 'color.js';
import { ThemeModelType } from 'os/services/theme.model';
// const colors = ['#005050', '#000000', '#505050', '#000050', '#a05050'];
// ['#005050', '#000000']
// ['#f0a0a0', '#a0a0a0', '#a0f0f0', '#f0f0f0', '#f0f0a0']
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
    return window.electron.os.desktop.changeWallpaper(spacePath, theme);
  },
  setActive: async (spacePath: string, app: any) => {
    return window.electron.os.desktop.setActive(spacePath, app);
  },
  setHomePane: async (isHome: boolean) => {
    return window.electron.os.desktop.setHomePane(isHome);
  },
  setMouseColor: async (mouseColor: string) => {
    return window.electron.os.desktop.setMouseColor(mouseColor);
  },
  setAppDimensions: async (
    windowId: any,
    dimensions: { width: number; height: number; x: number; y: number }
  ) => {
    return window.electron.os.desktop.setAppDimensions(windowId, dimensions);
  },
  setPartitionCookies: (partition: string, cookies: any) => {
    return window.electron.app.setPartitionCookies(partition, cookies);
  },
  openAppWindow: async (spacePath: string, app: any) => {
    return window.electron.os.desktop.openAppWindow(spacePath, app);
  },
  closeAppWindow: async (spacePath: string, app: any) => {
    return window.electron.os.desktop.closeAppWindow(spacePath, app);
  },
  toggleDevTools: async () => {
    return window.electron.app.toggleDevTools();
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
