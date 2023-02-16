import { AppPreloadType } from 'main/preload';
import { OSPreloadType } from 'os/preload';

export {};

declare global {
  var electron: {
    app: AppPreloadType;
    os: OSPreloadType;
  };
  var audio: HTMLAudioElement;
  var ship: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      webview: Electron.WebviewTag;
    }
  }
}
