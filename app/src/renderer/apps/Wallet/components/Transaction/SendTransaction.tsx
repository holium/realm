import { Box, Flex, Text } from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
  UqTxType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { WalletScreen } from '../../types';
import { TransactionPane } from './TransactionPane';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

type Props = {
  hidden: boolean;
  onScreenChange: any;
  protocol: ProtocolType;
  network: NetworkType;
  uqTx?: UqTxType;
  close: () => void;
  wallet: EthWalletType | BitcoinWalletType;
  coin: ERC20Type | null;
  onConfirm: () => void;
  transactionAmount: any;
  setTransactionAmount: any;
  transactionRecipient: any;
  setTransactionRecipient: any;
  screen: WalletScreen;
  ethereum: any;
  currentWallet?: EthWalletType | BitcoinWalletType;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  to: string | undefined;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
};

export const SendTransaction = ({
  coin,
  hidden,
  onScreenChange,
  protocol,
  network,
  uqTx,
  close,
  wallet,
  onConfirm,
  transactionAmount,
  setTransactionAmount,
  transactionRecipient,
  setTransactionRecipient,
  screen,
  ethereum,
  currentWallet,
  navigate,
  to,
  getRecipient,
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
    <Box width="100%" hidden={hidden} color="card">
      <Flex flexDirection="column" gap={10}>
        <Separator />
        <TransactionPane
          protocol={protocol}
          network={network}
          ethereum={ethereum}
          currentWallet={currentWallet}
          screen={
            screen === WalletScreen.TRANSACTION_SEND ? 'initial' : 'confirm'
          }
          navigate={navigate}
          onConfirm={onConfirm}
          max={
            coin
              ? Number(coin.balance)
              : Number((wallet as EthWalletType).data.get(protocol)?.balance)
          }
          onScreenChange={onScreenChange}
          uqbarContract={uqbarContract}
          close={close}
          coin={coin}
          setTransactionAmount={setTransactionAmount}
          transactionAmount={transactionAmount}
          setTransactionRecipient={setTransactionRecipient}
          transactionRecipient={transactionRecipient}
          to={to}
          getRecipient={getRecipient}
        />
      </Flex>
    </Box>
  );
};
