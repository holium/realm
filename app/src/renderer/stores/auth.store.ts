import {
  applySnapshot,
  castToSnapshot,
  clone,
  flow,
  getSnapshot,
  tryReference,
  types,
} from 'mobx-state-tree';

import { LoginErrorType } from 'os/realm.types';
import {
  AccountView,
  AuthUpdateAccountPayload,
} from 'os/services/auth/auth.types';
import { OnboardingEndedPayload } from 'os/services/auth/onboarding.types';
import { trackEvent } from 'renderer/lib/track';
import { AuthIPC } from 'renderer/stores/ipc';

import { appState } from './app.store';
import { RealmIPC } from './ipc';
import { AccountModel } from './models/account.model';

export type LoginStatusStateType = 'initial' | 'loading' | 'success' | 'error';

export const LoginError = types.enumeration([
  'bad-gateway',
  'password',
  'missing',
  'code',
  'unknown',
  '',
]);

const LoginStatusState = types.enumeration([
  'initial',
  'loading',
  'success',
  'error',
]);

export const LoginStatus = types
  .model('LoginStatus', {
    state: LoginStatusState,
    error: types.maybe(LoginError),
  })
  .actions((self) => ({
    setState(state: LoginStatusStateType) {
      self.state = state;
    },
    setError(error: LoginErrorType) {
      self.error = error;
      self.state = 'error';
    },
    reset() {
      self.state = 'initial';
      self.error = '';
    },
  }));

export type LoginStatusType = typeof LoginStatus;

export const AuthenticationModel = types
  .model('AuthenticationModel', {
    selected: types.safeReference(AccountModel),
    accounts: types.array(AccountModel),
    session: types.maybeNull(types.reference(AccountModel)),
    order: types.array(types.string),
    status: LoginStatus,
  })
  .actions((self) => ({
    setSelected(patp: string) {
      self.selected = tryReference(() =>
        self.accounts.find((acc) => acc.patp === patp)
      );
    },
    setAccounts(accounts?: AccountView[]) {
      if (!accounts) return;
      applySnapshot(self.accounts, castToSnapshot(accounts));
    },
    _setSession(patp: string, _: string) {
      const account = self.accounts.find((a) => a.patp === patp);
      if (!account) {
        throw new Error('Account not found');
      }
      trackEvent('CLICK_LOG_IN', 'LOGIN_SCREEN');
      self.status.setState('success');
      self.session = account;
    },
    _clearSession(patp: string) {
      if (self.session?.patp === patp) {
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
        self.status.setState('initial');
        self.session = null;
      }
    },
    // _authSuccess(data: AuthUpdateLogin) {
    //   // self.session = account;
    // },
    // _authError(data: AuthUpdateLogin) {},
    // //
    setAccountCurrentTheme(theme: any) {
      const account = self.accounts.find((a) => a.patp === self.session?.patp);
      if (account) {
        account.theme = clone(theme);
        AuthIPC.setAccountTheme(account.patp, getSnapshot(theme));
      }
    },
    // use flow to login the account
    login: flow(function* (patp: string, password: string) {
      self.status.setState('loading');
      const account = self.accounts.find((a) => a.patp === patp);
      if (account) {
        try {
          const result = yield RealmIPC.login(account.patp, password);
          // wait for the login to finish
          if (result) {
            self.status.setState('success');
            // self.session = account;
          }
        } catch (e) {
          self.status.setState('error');
        }
      }
      return self.status;
    }),
    logout: flow(function* () {
      if (!self.session) {
        appState.setLoggedOut();
        return;
      }
      try {
        yield RealmIPC.logout(self.session.patp);
        self.session = null;
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
        self.status.setState('initial');
        self.session = null;
      } catch (e) {
        console.log(e);
      }
    }),
    shutdown: flow(function* () {
      if (self.session) {
        yield RealmIPC.shutdown(self.session.patp) as Promise<any>;
      } else {
        console.warn('missing session');
      }
    }),
    removeAccount: flow(function* (patp: string) {
      // TODO implement
      const removeIdx = self.accounts.findIndex((a) => a.patp === patp);
      const account = self.accounts[removeIdx];
      if (account) {
        yield AuthIPC.deleteAccount(account.patp);
        if (removeIdx > 0) {
          self.selected = self.accounts[removeIdx - 1];
        }
        self.accounts.remove(account);
        if (localStorage.getItem('lastAccountLogin') === patp) {
          localStorage.removeItem('lastAccountLogin');
        }
        if (self.accounts.length === 0) {
          self.session = null;
        }
      }
    }),
    // changePassword: flow(function* (patp: string, password: string) {
    //   // TODO implement
    //   const account = self.accounts.find((a) => a.patp === patp);
    //   if (account) {
    //     const result = yield AuthIPC.changePassword(
    //       account.patp,
    //       password
    //     ) as Promise<any>;
    //     if (result) {
    //       self.session = account;
    //     } else {
    //       // TODO show error
    //     }
    //   }
    // }),
    _onOnboardingEnded(accountsPayload: OnboardingEndedPayload) {
      accountsPayload.accounts.forEach((account) => {
        const existingAccount = self.accounts.find(
          (a) => a.patp === account.patp
        );
        if (!existingAccount) {
          self.accounts.push(AccountModel.create(account));
        }
      });

      applySnapshot(self.order, accountsPayload.order);
    },
    _onAddAccount(accountPayload: AuthUpdateAccountPayload) {
      const account = AccountModel.create(accountPayload.account);

      if (self.accounts.find((a) => a.patp === account.patp)) {
        return;
      }

      self.accounts.push(account);
      self.selected = tryReference(() =>
        self.accounts.find((acc) => acc.patp === account.patp)
      );
      applySnapshot(self.order, accountPayload.order);
    },
    _onRemoveAccount(accountPayload: AuthUpdateAccountPayload) {
      const account = self.accounts.find(
        (a) => a.patp === accountPayload.account.patp
      );
      if (account) {
        self.accounts.remove(account);
      }
      applySnapshot(self.order, accountPayload.order);
    },
    _onUpdateAccount(accountPayload: AuthUpdateAccountPayload) {
      const account = self.accounts.find(
        (a) => a.patp === accountPayload.account.patp
      );
      if (account) {
        applySnapshot(account, accountPayload.account);
        applySnapshot(self.order, accountPayload.order);
      }
    },
  }));
