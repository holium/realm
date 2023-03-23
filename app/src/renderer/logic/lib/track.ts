import { track } from '@amplitude/analytics-browser';

type Screen = 'ONBOARDING_SCREEN' | 'LOGIN_SCREEN' | 'DESKTOP_SCREEN';

type Action =
  | 'CLICK_INSTALL_REALM'
  | 'CLICK_LOG_IN'
  | 'CLICK_LOG_OUT'
  | 'CLICK_NOTIFICATION';

export const trackEvent = (
  event: Action,
  screen: Screen,
  extra?: { [key: string]: string }
) => {
  track(event, { [screen]: true, extra });
};
