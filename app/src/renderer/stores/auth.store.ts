import { RealmIPC } from './ipc';
import {
  types,
  applySnapshot,
  clone,
  flow,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { AuthIPC } from 'renderer/stores/ipc';
import { AccountModel } from './models/account.model';
import { trackEvent } from 'renderer/lib/track';
import { appState } from './app.store';
import {
  AccountView,
  AuthUpdateAccountPayload,
} from 'os/services/auth/auth.types';
import { LoginErrorType } from 'os/realm.types';

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
    accounts: types.array(AccountModel),
    session: types.maybeNull(types.reference(AccountModel)),
    order: types.array(types.string),
    status: LoginStatus,
  })
  .actions((self) => ({
    setAccounts(accounts?: AccountView[]) {
      if (!accounts) return;
      applySnapshot(self.accounts, castToSnapshot(accounts));
    },
    _setSession(patp: string) {
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
          const result = yield RealmIPC.login(
            account.patp,
            password
          ) as Promise<any>;
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
        yield RealmIPC.logout(self.session.patp) as Promise<any>;
        self.session = null;
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
        self.status.setState('initial');
        self.session = null;
      } catch (e) {
        console.log(e);
      }
    }),
    shutdown() {
      // TODO implement
      try {
        // yield RealmIPC.shutdown(self.session?.patp) as Promise<any>;
        self.session = null;
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
        self.status.setState('initial');
        self.session = null;
      } catch (e) {
        console.log(e);
      }
    },
    removeAccount: flow(function* (patp: string) {
      // TODO implement
      const account = self.accounts.find((a) => a.patp === patp);
      if (account) {
        const result = yield AuthIPC.deleteAccount(
          account.patp
        ) as Promise<any>;
        if (result) {
          self.accounts.remove(account);
        } else {
          // TODO show error
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
    _onAddAccount(accountPayload: AuthUpdateAccountPayload) {
      console.log('onAddAccount', accountPayload);
      const account = AccountModel.create(accountPayload.account);
      self.accounts.push(account);
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
