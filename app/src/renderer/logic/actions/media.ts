export const MediaActions = {
  askForMicrophone: () => {
    return window.electron.app.askForMicrophone();
  },
};
