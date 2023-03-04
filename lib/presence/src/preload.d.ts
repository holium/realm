import { MultiplayerPreloadType } from '../../../app/src/main/preload.multiplayer';

declare global {
  interface Window {
    ship: string;
    electron: {
      multiplayer: MultiplayerPreloadType;
    };
  }
}

export {};
