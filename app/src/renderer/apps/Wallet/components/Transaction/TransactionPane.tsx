import { useState } from 'react';

import { Button, Flex, Text } from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import { TransactionRecipient, WalletScreen } from 'renderer/apps/Wallet/types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { AmountInput } from './AmountInput';
import { RecipientInput } from './RecipientInput';
import { TransactionRecipientInfo } from './TransactionRecipientInfo';

const abbrMap = {
  [NetworkType.ETHEREUM]: 'ETH',
  [NetworkType.BITCOIN]: 'BTC',
};

const ethToUsd = (eth: number, currentPrice: number) =>
  isNaN(eth) ? 0 : (eth * currentPrice).toFixed(2);

type Props = {
  wallet: EthWalletType | BitcoinWalletType;
  protocol: ProtocolType;
  network: NetworkType;
  ethPrice: number | undefined;
  screen: 'initial' | 'confirm';
  coin: ERC20Type | null;
  transactionAmount: number;
  to: string | undefined;
  uqbarContract: boolean;
  setTransactionAmount: (amount: number) => void;
  transactionRecipient: TransactionRecipient | null;
  setTransactionRecipient: (recipient: TransactionRecipient) => void;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  close: () => void;
  onConfirm: () => void;
};

export const TransactionPane = ({
  wallet,
  protocol,
  network,
  ethPrice,
  screen,
  coin,
  to,
  uqbarContract,
  transactionAmount,
  setTransactionAmount,
  transactionRecipient,
  setTransactionRecipient,
  getRecipient,
  navigate,
  close,
  onConfirm,
}: Props) => {
  const [amountValid, setAmountValid] = useState(false);

  const [recipientValid, setRecipientValid] = useState(false);

  const max = coin
    ? Number(coin.balance)
    : Number((wallet as EthWalletType).data.get(protocol)?.balance);

  const next = () => {
    if (protocol === ProtocolType.UQBAR) {
      // enqueueUqbarTransaction(
      //   walletIndex ?? '',
      //   transactionAmount
      // );
    } else {
      navigate(WalletScreen.TRANSACTION_CONFIRM, {
        walletIndex: `${wallet?.index}`,
        protocol: protocol,
        ...(coin && {
          detail: {
            type: 'coin',
            txtype: 'coin',
            coinKey: coin.address,
            key: coin.address,
          },
        }),
      });
    }
  };

  const prev = () => {
    navigate(WalletScreen.TRANSACTION_SEND);
  };

  const amountValidator = (valid: boolean, amount?: number) => {
    setAmountValid(valid);
    if (valid && amount) {
      setTransactionAmount(amount);
    }
  };

  const recipientValidator = (
    valid: boolean,
    recipient: { address?: string; patp?: string; patpAddress?: string }
  ) => {
    setRecipientValid(valid);
    if (valid) {
      setTransactionRecipient(recipient);
    }
  };

  if (screen === 'initial') {
    return (
      <Flex flex={1} flexDirection="column" justifyContent="space-between">
        <Flex flexDirection="column" gap="10px">
          <AmountInput
            max={max}
            coin={coin}
            setValid={amountValidator}
            protocol={protocol}
            network={network}
            ethPrice={ethPrice}
          />
          <RecipientInput
            to={to}
            network={network}
            getRecipient={getRecipient}
            setValid={recipientValidator}
          />
        </Flex>
        <Flex gap="10px">
          <Button.Secondary
            flex={1}
            justifyContent="center"
            onClick={() => close()}
          >
            Cancel
          </Button.Secondary>
          <Button.TextButton
            flex={1}
            justifyContent="center"
            disabled={!recipientValid || !amountValid}
            onClick={next}
          >
            Next
          </Button.TextButton>
        </Flex>
      </Flex>
    );
  }
  console.log('transactionRecipient', transactionRecipient);

  return (
    <Flex flexDirection="column" flex={1}>
      {!uqbarContract && (
        <Flex flexDirection="column" flex={1}>
          <Flex
            width="100%"
            flexDirection="column"
            justifyContent="space-evenly"
            alignItems="center"
            gap="16px"
          >
            <Flex
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text.Body variant="body">TO</Text.Body>
              <TransactionRecipientInfo
                transactionRecipient={transactionRecipient}
              />
            </Flex>
            <Flex
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text.Body variant="body">NETWORK FEE</Text.Body>
              <Flex flexDirection="column">
                <Text.Body variant="body">0.001 ETH</Text.Body>
                {protocol === ProtocolType.ETH_MAIN && (
                  <Text.Body fontSize={1}>
                    ≈ {ethPrice ? ethToUsd(0.0005, ethPrice) : '...'} USD
                  </Text.Body>
                )}
              </Flex>
            </Flex>
            <Flex
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text.Body variant="body">TOTAL</Text.Body>
              <Flex flexDirection="column">
                <Text.Body variant="body">
                  {transactionAmount + 0.0005} {coin ? coin.name : 'ETH'}
                </Text.Body>
                {protocol === ProtocolType.ETH_MAIN && (
                  <Text.Body fontSize={1}>
                    ≈{' '}
                    {ethPrice
                      ? ethToUsd(transactionAmount + 0.0005, ethPrice)
                      : '...'}{' '}
                    USD
                  </Text.Body>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
      <Flex gap="10px">
        <Button.Secondary flex={1} justifyContent="center" onClick={prev}>
          Cancel
        </Button.Secondary>
        <Button.TextButton
          flex={1}
          justifyContent="center"
          color="intent-success"
          onClick={onConfirm}
        >
          Send {abbrMap[network]}
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
