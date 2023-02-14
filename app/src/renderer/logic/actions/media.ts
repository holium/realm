export const MediaActions = {
  askForMicrophone: async () => {
    return await window.electron.app.askForMicrophone();
  },
};
