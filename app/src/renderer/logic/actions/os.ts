export const OSActions = {
  boot: async () => {
    return await window.electron.os.boot();
  },
  onEffect: (callback: any) => {
    return window.electron.os.onEffect(callback);
  },
  onBoot: (callback: any) => {
    return window.electron.os.onBoot(callback);
  },
  applyAction: async (action: any) => {
    return await window.electron.os.applyAction(action);
  },
};
