export const OSActions = {
  onBoot: async () => {
    return await window.electron.os.boot();
  },
  applyAction: async (action: any) => {
    return await window.electron.os.applyAction(action);
  },
};
