import { RealmIPC } from './ipc';
import {
  applyPatch,
  Instance,
  types,
  onSnapshot,
  applySnapshot,
  clone,
  flow,
  getSnapshot,
} from 'mobx-state-tree';
import { toJS } from 'mobx';
import { AuthIPC, ShipIPC } from 'renderer/stores/ipc';
import { AccountModel, AccountModelType } from './models/account.model';
import { AuthUpdateLogin } from 'os/services-new/auth/auth.service';
import { trackEvent } from 'renderer/logic/lib/track';

export const LoginStatus = types.enumeration([
  'initial',
  'loading',
  'success',
  'error',
]);
export type LoginStatusType = typeof LoginStatus;

export const AuthenticationModel = types
  .model('AuthenticationModel', {
    accounts: types.array(AccountModel),
    session: types.maybeNull(types.reference(AccountModel)),
    status: LoginStatus,
  })
  .actions((self) => ({
    _setAccounts(accounts: AccountModelType[]) {
      applySnapshot(self.accounts, accounts);
    },
    _setSession(patp: string) {
      const account = self.accounts.find((a) => a.patp === patp);
      if (!account) {
        throw new Error('Account not found');
      }
      trackEvent('CLICK_LOG_IN', 'LOGIN_SCREEN');
      self.status = 'success';
      self.session = account;
    },
    _clearSession(patp: string) {
      if (self.session?.patp === patp) {
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
        self.status = 'initial';
        self.session = null;
      }
    },
    _authSuccess(data: AuthUpdateLogin) {
      // self.session = account;
    },
    _authError(data: AuthUpdateLogin) {},
    //
    setAccountCurrentTheme(theme: any) {
      const account = self.accounts.find((a) => a.patp === self.session?.patp);
      if (account) {
        account.theme = clone(theme);
        AuthIPC.setAccountTheme(account.patp, getSnapshot(theme));
      }
    },
    // use flow to login the account
    login: flow(function* (patp: string, password: string) {
      self.status = 'loading';
      const account = self.accounts.find((a) => a.patp === patp);
      if (account) {
        try {
          const result = yield RealmIPC.login(
            account.patp,
            password
          ) as Promise<any>;
          // wait for the login to finish
          if (result) {
            self.status = 'success';
            // self.session = account;
          }
        } catch (e) {
          self.status = 'error';
        }
      }
      return self.status;
    }),
    logout: flow(function* () {
      try {
        yield RealmIPC.logout(self.session?.patp) as Promise<any>;
        self.session = null;
        trackEvent('CLICK_LOG_OUT', 'DESKTOP_SCREEN');
        self.status = 'initial';
        self.session = null;
      } catch (e) {
        console.log(e);
      }
    }),
    removeAccount: flow(function* (patp: string) {
      // TODO implement
      // const account = self.accounts.find((a) => a.patp === patp);
      // if (account) {
      //   const result = yield AuthIPC.removeAccount(account.patp) as Promise<
      //     any
      //     >;
      //   if (result) {
      //     self.accounts.remove(account);
      //   } else {
      //     // TODO show error
      //   }
      // }
    }),
    changePassword: flow(function* (patp: string, password: string) {
      // TODO implement
      // const account = self.accounts.find((a) => a.patp === patp);
      // if (account) {
      //   const result = yield AuthIPC.changePassword(
      //     account.patp,
      //     password
      //   ) as Promise<any>;
      //   if (result) {
      //     self.session = account;
      //   } else {
      //     // TODO show error
      //   }
      // }
    }),
  }));

ShipIPC.onUpdate((_evt: any, update: any) => {
  console.log('ShipIPC.onUpdate', update);
});

// AuthIPC.onUpdate((_evt: any, update: AuthUpdateTypes) => {
//   switch (update.type) {
//     case 'init':
//       appState.authStore._setAccounts((update as AuthUpdateInit).payload);
//       break;
//     case 'login':
//       appState.authStore._setSession((update as AuthUpdateLogin).payload.patp);
//       break;
//     // case 'logout':
//     //   authState.session = null;
//     //   break;

//     default:
//       break;
//   }
// });
