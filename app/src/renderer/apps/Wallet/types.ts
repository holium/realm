export enum WalletScreen {
  LIST = 'list',
  NEW = 'new',
  WALLET_DETAIL = 'detail',
  TRANSACTION_SEND = 'send',
  TRANSACTION_CONFIRM = 'confirm',
  TRANSACTION_DETAIL = 'transaction',
  NFT_DETAIL = 'ethereum:nft',
  LOCKED = 'locked',
  SETTINGS = 'settings',
  CREATE_WALLET = 'create-wallet',
}

export enum NewWalletScreen {
  CREATE = 'create',
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
