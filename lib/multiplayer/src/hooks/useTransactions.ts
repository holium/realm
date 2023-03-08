import { useEffect } from 'react';

export type SendTransaction = (
  patp: string,
  version: number,
  steps: any,
  clientID: string | number
) => void;

const sendTransaction: SendTransaction = (patp, version, steps, clientID) => {
  window.electron.multiplayer.appToRealmSendTransaction(
    patp,
    version,
    steps,
    clientID
  );
};

type Props = {
  onTransaction: (
    patp: string,
    version: number,
    steps: any,
    clientID: string | number
  ) => void;
};

export const useTransactions = ({ onTransaction }: Props) => {
  useEffect(() => {
    window.electron.multiplayer.onRealmToAppSendTransaction(onTransaction);
  }, [onTransaction]);

  return { sendTransaction };
};
