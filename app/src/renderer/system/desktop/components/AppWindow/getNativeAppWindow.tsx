import { BrowserWebview } from 'renderer/apps/Browser/BrowserWebview';
import {
  BrowserToolbar,
  BrowserToolbarProps,
} from 'renderer/apps/Browser/Toolbar/BrowserToolbar';
import { LexiconApp } from 'renderer/apps/Lexicon/LexiconApp';
import { SystemApp } from 'renderer/apps/System';
import { TroveApp } from 'renderer/apps/Trove/TroveApp';

export enum NativeAppId {
  Browser = 'os-browser',
  Settings = 'os-settings',
  Lexicon = 'lexicon',
  Trove = 'trove',
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
  lexicon: {
    titlebar: null,
    view: (props: any) => <LexiconApp {...props} />,
  },
  trove: {
    titlebar: null,
    view: (props: any) => <TroveApp {...props} />,
  },
};
