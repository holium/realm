import { SystemApp } from './System';
import { Browser, BrowserProps } from './Browser';
import { OnboardingApp } from './Onboarding';
import { BrowserToolbar, BrowserToolbarProps } from './Browser/Toolbar';

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
  'onboarding-dev': {
    component: (props: any) => <OnboardingApp {...props} />
  }
};
