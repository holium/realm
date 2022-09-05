import { Patp } from 'os/types';
/**
 * DmActions for interfacing with core process
 */
export const DmActions = {
  getDMs: async () => {
    return await window.electron.os.ship.getDMs();
  },
  sendDm: async (toShip: string, content: any[]) => {
    return await window.electron.os.ship.sendDm(toShip, content);
  },
  draftDm: async (patps: Patp[], metadata: any[]) => {
    return await window.electron.os.ship.draftDm(patps, metadata);
  },
  acceptDm: async (toShip: string) => {
    return await window.electron.os.ship.acceptDm(toShip);
  },
  declineDm: async (toShip: string) => {
    return await window.electron.os.ship.declineDm(toShip);
  },
  setScreen: async (screen: boolean) => {
    return await window.electron.os.ship.setScreen(screen);
  },
};
