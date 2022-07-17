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
  getOurGroups: async () => {
    return await window.electron.os.ship.getOurGroups();
  },
  createSpace: async (data: any) => {
    return await window.electron.os.spaces.createSpace(data);
  },
  updateSpace: async (path: any, update: any) => {
    return await window.electron.os.spaces.updateSpace(path, update);
  },
  deleteSpace: async (path: any) => {
    return await window.electron.os.spaces.deleteSpace(path);
  },
};
