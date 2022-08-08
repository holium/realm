/**
 * BazaarActions for interfacing with core process
 */
export const BazaarActions = {
  getApps: async (spacePath: string, category: string = 'all') => {
    return await window.electron.os.bazaar.getApps(spacePath, category);
  },
  getAllies: async () => {
    return await window.electron.os.bazaar.getAllies();
  },
  getTreaties: async (ship: string) => {
    return await window.electron.os.bazaar.getTreaties(ship);
  },
};
