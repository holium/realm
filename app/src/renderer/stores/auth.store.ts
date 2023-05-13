import {
  applySnapshot,
  castToSnapshot,
  clone,
  flow,
  getSnapshot,
  tryReference,
  types,
} from 'mobx-state-tree';

import { OnboardingStorage } from '@holium/shared';

import { LoginErrorType } from 'os/realm.types';
import { DBAccount } from 'os/services/auth/accounts.table';
import { AuthUpdateAccountPayload } from 'os/services/auth/auth.types';
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
    setSelected(serverId: string) {
      self.selected = tryReference(() =>
        self.accounts.find((acc) => acc.serverId === serverId)
      );
    },
    setAccounts(accounts?: DBAccount[]) {
      if (!accounts) return;
      applySnapshot(self.accounts, castToSnapshot(accounts));
    },
    _setSession(serverId: string) {
      const account = self.accounts.find((a) => a.serverId === serverId);
      if (!account) {
        throw new Error('DBAccount not found');
      }
      trackEvent('CLICK_LOG_IN', 'LOGIN_SCREEN');
      self.status.setState('success');
      self.session = account;
    },
    _clearSession(serverId?: string) {
      if (self.session?.serverId === serverId) {
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
      }
      self.status.setState('initial');
      self.session = null;
    },
    // _authSuccess(data: AuthUpdateLogin) {
    //   // self.session = account;
    // },
    // _authError(data: AuthUpdateLogin) {},
    // //
    setAccountCurrentTheme(theme: any) {
      const account = self.accounts.find(
        (a) => a.serverId === self.session?.serverId
      );
      if (account) {
        account.theme = clone(theme);
        AuthIPC.setAccountTheme(account.serverId, getSnapshot(theme));
      }
    },
    // use flow to login the account
    login: flow(function* (serverId: string, password: string) {
      self.status.setState('loading');
      const account = self.accounts.find((a) => a.serverId === serverId);
      if (account) {
        try {
          const result = yield RealmIPC.login(account.serverId, password);
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
        yield RealmIPC.logout(self.session.serverId);
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
        yield RealmIPC.shutdown(self.session.serverId) as Promise<any>;
      } else {
        console.warn('missing session');
      }
    }),
    removeAccount: flow(function* (serverId: string) {
      // TODO implement
      const removeIdx = self.accounts.findIndex((a) => a.serverId === serverId);
      const account = self.accounts[removeIdx];
      if (account) {
        yield AuthIPC.deleteAccount(account.serverId);
        if (removeIdx > 0) {
          self.selected = self.accounts[removeIdx - 1];
        }
        self.accounts.remove(account);
        const { lastAccountLogin } = OnboardingStorage.get();
        if (lastAccountLogin === serverId) {
          OnboardingStorage.remove('lastAccountLogin');
        }
        if (self.accounts.length === 0) {
          self.session = null;
        }
      }
    }),
    // changePassword: flow(function* (serverId: string, password: string) {
    //   // TODO implement
    //   const account = self.accounts.find((a) => a.serverId === serverId);
    //   if (account) {
    //     const result = yield AuthIPC.changePassword(
    //       account.serverId,
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
          (a) => a.serverId === account.serverId
        );
        if (!existingAccount) {
          self.accounts.push(AccountModel.create(account));
        }
      });

      applySnapshot(self.order, accountsPayload.order);
    },
    _onAddAccount(accountPayload: AuthUpdateAccountPayload) {
      const account = AccountModel.create(accountPayload.account);

      if (self.accounts.find((a) => a.serverId === account.serverId)) {
        return;
      }

      self.accounts.push(account);
      self.selected = tryReference(() =>
        self.accounts.find((acc) => acc.serverId === account.serverId)
      );
      applySnapshot(self.order, accountPayload.order);
    },
    _onRemoveAccount(accountPayload: AuthUpdateAccountPayload) {
      const account = self.accounts.find(
        (a) => a.serverId === accountPayload.account.serverId
      );
      if (account) {
        self.accounts.remove(account);
      }
      applySnapshot(self.order, accountPayload.order);
    },
    _onUpdateAccount(accountPayload: AuthUpdateAccountPayload) {
      const account = self.accounts.find(
        (a) => a.serverId === accountPayload.account.serverId
      );
      if (account) {
        applySnapshot(account, accountPayload.account);
        applySnapshot(self.order, accountPayload.order);
      }
    },
  }));
