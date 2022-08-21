export const OSActions = {
  boot: async () => {
    return await window.electron.os.boot();
  },
  onBoot: (callback: any) => {
    return window.electron.os.onBoot(callback);
  },
  onEffect: (callback: any) => {
    return window.electron.os.onEffect(callback);
  },
  applyAction: async (action: any) => {
    return await window.electron.os.applyAction(action);
  },
};
