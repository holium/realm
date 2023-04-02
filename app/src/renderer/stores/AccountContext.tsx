import { createContext, useState } from 'react';
import { AccountModelType } from './models/Account.model';

export interface AccountContextType {
  account: AccountModelType | null;
  setAccount: (account: AccountModelType | null) => void;
}

export const AccountContext = createContext<AccountContextType>({
  account: null,
  setAccount: (_account: AccountModelType | null) => {},
});

export const AccountProvider = ({ children }: any) => {
  const [account, setAccount] = useState<AccountModelType | null>(null);

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountContext;
