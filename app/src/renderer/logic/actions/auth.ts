/**
 * AuthActions for interfacing with core process
 */
export const AuthActions = {
  getShips: async () => {
    return await window.electron.os.auth.getShips();
  },
  removeShip: async (ship: string) => {
    return await window.electron.os.auth.removeShip(ship);
  },
  setSelected: async (ship: string) => {
    return await window.electron.os.auth.setSelected(ship);
  },
  setOrder: async (newOrder: any[]) => {
    return await window.electron.os.auth.setOrder(newOrder);
  },
  login: async (ship: string, password: string) => {
    return await window.electron.os.auth.login(ship, password);
  },
  logout: async (ship: string) => {
    return await window.electron.os.auth.logout(ship);
  },
  resetPassword: async (ship: string, password: string) => {
    // try {
    //   return await window.electron.os.auth.login(ship, password);
    // } catch (err) {
    //   return err;
    // }
  },
};
