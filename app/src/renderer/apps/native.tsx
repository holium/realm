import { SystemApp } from './System';
import { BrowserToolbar, BrowserToolbarProps } from './Browser/Toolbar/Toolbar';
import { TabView, TabViewProps } from './Browser/TabView';

export enum WindowId {
  Browser = 'os-browser',
  Settings = 'os-settings',
}

export const nativeRenderers = {
  'os-browser': {
    titlebar: (props: BrowserToolbarProps) => <BrowserToolbar {...props} />,
    component: ({ isResizing }: TabViewProps) => (
      <TabView isResizing={isResizing} />
    ),
  },
  'os-settings': {
    component: (props: any) => <SystemApp {...props} />,
  },
};
