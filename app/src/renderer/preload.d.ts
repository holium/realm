import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';

declare global {
  interface Window {
    electron: {
      app: AppPreloadType;
      os: OSPreloadType;
    };
    audio: any;
    ship: string;
  }
}

export {};
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      webview: Electron.WebviewTag;
    }
  }
}
