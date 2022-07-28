/**
 * PassportsActions for interfacing with core process
 */
export const PassportsActions = {
  getPassports: async (path: string) => {
    return await window.electron.os.spaces.getPassports(path);
  },
};
