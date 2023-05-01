import { track } from '@amplitude/analytics-browser';

type Screen = 'ONBOARDING_SCREEN' | 'LOGIN_SCREEN' | 'DESKTOP_SCREEN';
type Apps =
  | 'CHAT_INBOX'
  | 'CHAT_LOG'
  | 'ROOMS_LIST'
  | 'ROOMS_VOICE'
  | 'WALLET'
  | 'SETTINGS';

type Action =
  | 'CLICK_INSTALL_REALM'
  | 'CLICK_LOG_IN'
  | 'CLICK_LOG_OUT'
  | 'CLICK_NOTIFICATION'
  | 'CLICK_SHUTDOWN'
  | 'OPENED';

export const trackEvent = (
  event: Action,
  screen: Screen | Apps,
  extra?: { [key: string]: string }
) => {
  track(event, { [screen]: true, extra });
};
