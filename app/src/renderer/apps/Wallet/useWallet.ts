import { Wallet } from 'ethers';
import { Patp } from 'os/types';
import { createContext, useContext } from 'react';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { handleWalletReactions } from 'os/api/wallet';

export const createManager = (our: Patp) => {
  const walletManager = new Wallet();
  WalletActions.onAgentUpdate((_event: any, data: any) => {
    handleWalletReactions(data, walletManager)
  });
  WalletActions.onNetworkUpdate((_event: any, data: any) => {
    
  });
  return walletManager;
};

const WalletContext = createContext<null | Wallet>(null);

export const WalletProvider = WalletContext.Provider;
export function useWallet() {
  const walletManager = useContext(WalletContext);
  if (walletManager === null) {
    throw new Error(
      'walletManager cannot be null, please add a context provider'
    );
  }
  return walletManager;
}
