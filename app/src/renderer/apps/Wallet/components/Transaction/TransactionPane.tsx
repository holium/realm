import { useState } from 'react';

import { Box, Button, Flex, Text } from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import { TransactionRecipient, WalletScreen } from 'renderer/apps/Wallet/types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthStoreType,
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
  ethereum: EthStoreType;
  screen: 'initial' | 'confirm';
  coin: ERC20Type | null;
  transactionAmount: number;
  setTransactionAmount: (amount: number) => void;
  transactionRecipient: TransactionRecipient | null;
  setTransactionRecipient: (recipient: TransactionRecipient) => void;
  uqbarContract: boolean;
  to: string | undefined;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  close: () => void;
  onConfirm: () => void;
};

export const TransactionPane = ({
  wallet,
  protocol,
  network,
  ethereum,
  navigate,
  screen,
  close,
  coin,
  onConfirm,
  transactionAmount,
  setTransactionAmount,
  transactionRecipient,
  setTransactionRecipient,
  uqbarContract,
  to,
  getRecipient,
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

  return (
    <>
      {screen === 'initial' ? (
        <Flex flexDirection="column">
          <AmountInput
            max={max}
            coin={coin}
            setValid={amountValidator}
            protocol={protocol}
            network={network}
            ethereum={ethereum}
          />
          <Box width="100%">
            <RecipientInput
              to={to}
              network={network}
              getRecipient={getRecipient}
              setValid={recipientValidator}
            />
          </Box>
          <Flex justifyContent="space-between">
            <Button.TextButton variant="transparent" onClick={() => close()}>
              Cancel
            </Button.TextButton>
            <Button.TextButton
              disabled={!recipientValid || !amountValid}
              onClick={next}
            >
              Next
            </Button.TextButton>
          </Flex>
        </Flex>
      ) : (
        <Flex flexDirection="column">
          {!uqbarContract && (
            <>
              <Text.Body
                opacity={0.9}
                fontWeight={600}
                fontSize={7}
                animate={false}
              >
                {transactionAmount}{' '}
                {coin
                  ? coin.name
                  : protocol === ProtocolType.UQBAR
                  ? 'zigs'
                  : abbrMap[network]}
              </Text.Body>
              {protocol === ProtocolType.ETH_MAIN && (
                <Text.Body>
                  ${ethToUsd(transactionAmount, ethereum.conversions.usd ?? 0)}{' '}
                  USD
                </Text.Body>
              )}
              <Flex
                width="100%"
                flexDirection="column"
                justifyContent="space-evenly"
                alignItems="center"
              >
                <Flex width="100%" justifyContent="space-between">
                  <Text.Body variant="body">TO</Text.Body>
                  <TransactionRecipientInfo
                    transactionRecipient={transactionRecipient}
                  />
                </Flex>
                <Flex width="100%" justifyContent="space-between">
                  <Text.Body variant="body">NETWORK FEE</Text.Body>
                  <Flex flexDirection="column">
                    <Text.Body variant="body">0.001 ETH</Text.Body>
                    {protocol === ProtocolType.ETH_MAIN && (
                      <Text.Body fontSize={1}>
                        ≈ {ethToUsd(0.0005, ethereum.conversions.usd ?? 0)} USD
                      </Text.Body>
                    )}
                  </Flex>
                </Flex>
                <Flex width="100%" justifyContent="space-between">
                  <Text.Body variant="body">TOTAL</Text.Body>
                  <Flex flexDirection="column">
                    <Text.Body variant="body">
                      {transactionAmount + 0.0005} {coin ? coin.name : 'ETH'}
                    </Text.Body>
                    {protocol === ProtocolType.ETH_MAIN && (
                      <Text.Body fontSize={1}>
                        ≈{' '}
                        {ethToUsd(
                          transactionAmount + 0.0005,
                          ethereum.conversions.usd ?? 0
                        )}{' '}
                        USD
                      </Text.Body>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}
          <Flex justifyContent="space-between">
            <Button.TextButton variant="transparent" onClick={() => prev()}>
              Reject
            </Button.TextButton>
            <Button.TextButton
              px={2}
              onClick={onConfirm} // sendTransaction}
            >
              Confirm
            </Button.TextButton>
          </Flex>
        </Flex>
      )}
    </>
  );
};
