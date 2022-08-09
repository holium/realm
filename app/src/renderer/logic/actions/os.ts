import { SoundActions } from './sound';
export const OSActions = {
  onBoot: async () => {
    let w: Promise<any> = await window.electron.os.boot();
    SoundActions.playStartup();
    return w;
  },
  applyAction: async (action: any) => {
    return await window.electron.os.applyAction(action);
  },
};
