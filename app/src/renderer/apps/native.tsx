import { SystemApp } from './System';
import { Browser, BrowserProps } from './Browser';
import { BrowserToolbar, BrowserToolbarProps } from './Browser/Toolbar';
import { AirliftToolbar, AirliftToolbarProps } from './Airlift/Toolbar';
import { Airlift } from './Airlift';

export type NativeRenders = {
  [key: string]: {
    titlebar?: React.FC<any>;
    component: React.FC<any>;
  };
};

export const nativeRenderers: NativeRenders = {
  'os-browser': {
    titlebar: (props: BrowserToolbarProps) => <BrowserToolbar {...props} />,
    component: (props: BrowserProps) => <Browser {...props} />,
  },
  'os-settings': {
    component: (props: any) => <SystemApp {...props} />,
  },
  'airlift': {
    titlebar: (props: AirliftToolbarProps) => <AirliftToolbar {...props} />,
    component: (props: any) => <Airlift {...props} />,
  }
};
