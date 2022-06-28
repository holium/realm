/**
 * SpacesActions for interfacing with core process
 */
export const SpacesActions = {
  pinApp: async (path: string, appId: string) => {
    return await window.electron.os.spaces.pinApp(path, appId);
  },
  unpinApp: async (path: string, appId: string) => {
    return await window.electron.os.spaces.unpinApp(path, appId);
  },
  setPinnedOrder: async (newOrder: any[]) => {
    return await window.electron.os.spaces.setPinnedOrder(newOrder);
  },
  selectSpace: async (path: string) => {
    return await window.electron.os.spaces.selectSpace(path);
  },
};
