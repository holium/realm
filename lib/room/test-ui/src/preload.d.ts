declare global {
  interface Window {
    ship: string;
    electron: {
      app: {
        playerMouseDownAppToRealm: (patp: string, elementId: string) => void;
        onPlayerMouseDown: (
          callback: (patp: string, elementId: string) => void
        ) => void;
      };
    };
  }
}

export {};
