import { AppData } from "../../../app/src/preload";

declare global {
  interface Window {
    appData: AppData;
  }
}

export {};
