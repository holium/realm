import { EventEmitter } from 'stream';

/**
 * Preference Service
 *
 */
export class PreferenceService extends EventEmitter {
  options: any;
  preferences: any;
  // private state?: any;

  constructor(options: any = {}) {
    super();
    this.options = options;
    this.preferences = {};
  }

  /**
   * Preload functions to register with the renderer
   */
  static preload = {};
}

export interface PreloadTypes {
  // Note the type of the static preload functions
}
/*
 *  - desktop
 *    - isolation-mode: boolean
 *    - window-manager: "calm", "classic"
 *  - mouse
 *    - cursor-type: "system", "realm"
 *    - use-profile-color: boolean
 *  - theme
 *    - appearance: "light" | "dark" | "wallpaper"
 *    - colors: "default" | "wallpaper-derived" | <hex value>
 *    - font: "default" | "custom"
 *      - google-font: "philosopher"
 */

interface BorderConfig {
  width: number;
  radius: number;
  style: 'dotted' | 'solid';
}
interface IPreference {
  desktop: {
    isolationMode: false; // v1
    windowManager: 'calm' | 'classic'; // v2
  };
  mouse: {
    cursorType: 'system' | 'realm'; // v2
    useProfileColor: boolean; // v1
  };
  theme: {
    appearance: 'light' | 'dark' | 'wallpaper-derived'; // v1
    accent: 'sigil' | 'custom'; // v1
    font: 'default' | 'custom'; // v2
    custom: {
      windows: {
        border: BorderConfig;
        customStyles: {};
      };
      systemBar: {
        border: BorderConfig;
        customStyles: {};
      };
      dialogs: {
        border: BorderConfig;
        customStyles: {};
      };
      colors: {
        //
      };
    };
  };
}
