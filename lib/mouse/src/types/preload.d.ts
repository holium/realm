import { AppPreloadType } from "../../../../app/src/main/preload";

declare global {
  interface Window {
    electron: {
      app: AppPreloadType;
    }
  }
}

export {};
