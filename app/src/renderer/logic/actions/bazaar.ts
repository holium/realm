/**
 * BazaarActions for interfacing with core process
 */
export const BazaarActions = {
  getApps: async (ship: string) => {
    return await window.electron.os.bazaar.getApps(ship);
  },
};
