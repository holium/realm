import { BrowserWebview } from 'renderer/apps/Browser/BrowserWebview';
import {
  BrowserToolbar,
  BrowserToolbarProps,
} from 'renderer/apps/Browser/Toolbar/Toolbar';
import { SystemApp } from 'renderer/apps/System';

export enum NativeAppId {
  Browser = 'os-browser',
  Settings = 'os-settings',
}

export const nativeAppWindow = {
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
};
