import { SystemApp } from '../../../../apps/System';
import {
  BrowserToolbar,
  BrowserToolbarProps,
} from '../../../../apps/Browser/Toolbar/Toolbar';
import { BrowserWebview } from '../../../../apps/Browser/BrowserWebview';

export enum AppId {
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
