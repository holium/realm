/**
 * PassportsActions for interfacing with core process
 */
export const PassportsActions = {
  getMembers: async (path: string) => {
    return await window.electron.os.spaces.getMembers(path);
  },
};
