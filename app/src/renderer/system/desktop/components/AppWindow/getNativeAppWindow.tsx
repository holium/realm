import { BrowserWebview } from 'renderer/apps/Browser/BrowserWebview';
import {
  BrowserToolbar,
  BrowserToolbarProps,
} from 'renderer/apps/Browser/Toolbar/BrowserToolbar';
import { SystemApp } from 'renderer/apps/System';
import { AirliftCommandPalette } from 'renderer/apps/Airlift/AirliftCommandPalette';

export enum NativeAppId {
  Browser = 'os-browser',
  Settings = 'os-settings',
}

export const getNativeAppWindow = {
  'os-browser': {
    titlebar: (props: BrowserToolbarProps) => <BrowserToolbar {...props} />,
    view: ({ isResizing = false, isDragging = false }) => (
      <BrowserWebview isResizing={isResizing} isDragging={isDragging} />
    ),
  },
  'os-settings': {
    titlebar: null,
    view: (props: any) => <SystemApp {...props} />,
  },
  airlift: {
    titlebar: null,
    view: (props: any) => <AirliftCommandPalette {...props} />,
  },
};
