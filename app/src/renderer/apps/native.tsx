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
    component: ({ isResizing = false, isDragging = false }) => (
      <BrowserWebview isResizing={isResizing} isDragging={isDragging} />
    ),
  },
  'os-settings': {
    component: (props: any) => <SystemApp {...props} />,
  },
};
