/**
 * BazaarActions for interfacing with core process
 */
export const BazaarActions = {
  getApps: async (
    spaceName: string,
    spacePath: string,
    category: string = 'all'
  ) => {
    return await window.electron.os.bazaar.getApps(
      spaceName,
      spacePath,
      category
    );
  },
  getAllies: async () => {
    return await window.electron.os.bazaar.getAllies();
  },
  getTreaties: async (ship) => {
    return await window.electron.os.bazaar.getTreaties();
  },
};
