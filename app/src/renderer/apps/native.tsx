import { SystemApp } from './System';
import { BrowserToolbar, BrowserToolbarProps } from './Browser/Toolbar/Toolbar';
import { BrowserWebview } from './Browser/BrowserWebview';

export enum WindowId {
  Browser = 'os-browser',
  Settings = 'os-settings',
}

export const nativeRenderers = {
  'os-browser': {
    titlebar: (props: BrowserToolbarProps) => <BrowserToolbar {...props} />,
    component: ({ isResizing = false }) => (
      <BrowserWebview isLocked={isResizing} />
    ),
  },
  'os-settings': {
    component: (props: any) => <SystemApp {...props} />,
  },
};
