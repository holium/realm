/**
 * SignupActions for interfacing with core process
 */
export const SignupActions = {
  addShip: async (newShip: { ship: string; url: string; code: string }) => {
    return await window.electron.os.signup.addShip(newShip);
  },
  getProfile: async (ship: string) => {
    return await window.electron.os.signup.getProfile(ship);
  },
  saveProfile: async (
    ship: string,
    data: { nickname: string; color: string; avatar: string }
  ) => {
    return await window.electron.os.signup.saveProfile(ship, data);
  },
  installRealm: async (ship: string) => {
    return await window.electron.os.signup.install(ship);
  },
  completeSignup: async () => {
    return await window.electron.os.signup.completeSignup();
  },
};
