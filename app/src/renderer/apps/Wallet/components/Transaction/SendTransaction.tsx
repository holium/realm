import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthStoreType,
  EthWalletType,
  UqTxType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { TransactionRecipient, WalletScreen } from '../../types';
import { TransactionPane } from './TransactionPane';

const SeparatorContainer = styled(Flex)`
  width: 200%;
  left: 50%;
  transform: translateX(-50%);
  position: relative;
  margin: 20px 0 32px 0;
  align-items: center;
`;

const SeparatorLine = styled(Flex)`
  flex: 1;
  height: 1px;
  background: rgba(var(--rlm-border-rgba));
`;

const SeparatorBox = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--rlm-accent-color);
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(var(--rlm-accent-rgba), 0.1);
`;

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

type Props = {
  wallet: EthWalletType | BitcoinWalletType;
  protocol: ProtocolType;
  network: NetworkType;
  uqTx?: UqTxType;
  to: string | undefined;
  coin: ERC20Type | null;
  transactionAmount: number;
  setTransactionAmount: (amount: number) => void;
  transactionRecipient: TransactionRecipient | null;
  setTransactionRecipient: (recipient: TransactionRecipient) => void;
  screen: WalletScreen;
  ethereum: EthStoreType;
  onConfirm: () => void;
  close: () => void;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
};

export const SendTransaction = ({
  wallet,
  coin,
  protocol,
  network,
  uqTx,
  to,
  transactionAmount,
  setTransactionAmount,
  transactionRecipient,
  setTransactionRecipient,
  screen,
  ethereum,
  navigate,
  getRecipient,
  close,
  onConfirm,
}: Props) => {
  const pendingTx = protocol === ProtocolType.UQBAR ? uqTx : null;
  const uqbarContract: boolean = pendingTx ? 'noun' in pendingTx.action : false;

  const Separator = () => (
    <SeparatorContainer>
      <SeparatorLine />
      <SeparatorBox>
        {uqbarContract
          ? 'Contract Interaction'
          : `Send ${
              coin
                ? coin.name
                : protocol === ProtocolType.UQBAR
                ? 'zigs'
                : abbrMap[network as 'bitcoin' | 'ethereum']
            }`}
      </SeparatorBox>
      <SeparatorLine />
    </SeparatorContainer>
  );

  return (
    <>
      <Separator />
      <TransactionPane
        protocol={protocol}
        network={network}
        ethereum={ethereum}
        wallet={wallet}
        screen={
          screen === WalletScreen.TRANSACTION_SEND ? 'initial' : 'confirm'
        }
        to={to}
        transactionAmount={transactionAmount}
        transactionRecipient={transactionRecipient}
        coin={coin}
        uqbarContract={uqbarContract}
        close={close}
        setTransactionAmount={setTransactionAmount}
        setTransactionRecipient={setTransactionRecipient}
        getRecipient={getRecipient}
        navigate={navigate}
        onConfirm={onConfirm}
      />
    </>
  );
};
