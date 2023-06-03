import { ProtocolType } from 'os/services/ship/wallet/wallet.types';
export enum WalletScreen {
  LIST = 'list',
  ONBOARDING = 'onboarding',
  WALLET_DETAIL = 'detail',
  TRANSACTION_SEND = 'send',
  TRANSACTION_CONFIRM = 'confirm',
  TRANSACTION_DETAIL = 'transaction',
  NFT_DETAIL = 'ethereum:nft',
  LOCKED = 'locked',
  SETTINGS = 'settings',
  CREATE_WALLET = 'create-wallet',
  FORGOT_PASSCODE = 'forgot-passcode',
}

export enum WalletOnboardingScreen {
  NO_WALLET = 'no_wallet',
  IMPORT = 'import',
  BACKUP = 'backup',
  CONFIRM = 'confirm',
  PASSCODE = 'passcode',
  CONFIRM_PASSCODE = 'confirm_passcode',
  FINALIZING = 'finalizing',
  DETECTED_EXISTING = 'detected_existing',
  RECOVER_EXISTING = 'recover_existing',
}

export type TxType = 'coin' | 'nft' | 'general' | undefined;

export type ERC20Amount = {
  big: bigint;
  full: string;
  display: string;
};

export type TransactionRecipient = {
  address?: string;
  patp?: string;
  patpAddress?: string;
  color?: string;
};

export type SendEthereumTransactionParams = {
  walletIndex: string;
  to: string;
  amount: string;
  passcode: number[];
  toPatp?: string;
};

export type SendEthereumTransaction = (
  props: SendEthereumTransactionParams
) => Promise<void>;

export type SendERC20TransactionParams = {
  walletIndex: string;
  currentProtocol: ProtocolType;
  path: string;
  toPatp: string;
  passcode: number[];
  from: string;
  to: string;
  amount: string;
  contractAddress: string;
  decimals: number;
};

export type SendERC20Transaction = (
  props: SendERC20TransactionParams
) => Promise<void>;
