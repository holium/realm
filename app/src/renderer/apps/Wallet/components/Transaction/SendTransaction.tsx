import { Box, Flex, Text } from '@holium/design-system/general';

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
    <Flex position="relative" width="100%" justifyContent="center" gap={10}>
      <Box position="absolute" width="300px" height="1px" left="-10px" />
      {uqbarContract ? (
        <Flex
          position="absolute"
          bottom="-12px"
          height="25px"
          width="170px"
          justifyContent="center"
          alignItems="center"
          borderRadius="50px"
        >
          <Text.Body color="accent">Contract Interaction</Text.Body>
        </Flex>
      ) : (
        <Flex
          position="absolute"
          px={2}
          bottom="-12px"
          min-width="80px"
          justifyContent="center"
          alignItems="center"
          borderRadius="50px"
        >
          <Text.Body color="accent">
            {`Send ${
              coin
                ? coin.name
                : protocol === ProtocolType.UQBAR
                ? 'zigs'
                : abbrMap[network as 'bitcoin' | 'ethereum']
            }
              `}
          </Text.Body>
        </Flex>
      )}
    </Flex>
  );

  return (
    <Box width="100%" color="card">
      <Flex flexDirection="column" gap={10}>
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
      </Flex>
    </Box>
  );
};
