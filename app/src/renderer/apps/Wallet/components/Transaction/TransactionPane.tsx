import { useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import { shortened } from 'renderer/apps/Wallet/helpers';
import { WalletScreen } from 'renderer/apps/Wallet/types';
import {
  ERC20Type,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { AmountInput } from './AmountInput';
import { RecipientInput } from './RecipientInput';

const abbrMap = {
  [NetworkType.ETHEREUM]: 'ETH',
  [NetworkType.BITCOIN]: 'BTC',
};

const ethToUsd = (eth: number, currentPrice: number) =>
  isNaN(eth) ? 0 : (eth * currentPrice).toFixed(2);

type Props = {
  protocol: ProtocolType;
  network: NetworkType;
  ethereum: any;
  currentWallet?: any;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  screen: 'initial' | 'confirm';
  max: number;
  onScreenChange: (screen: 'initial' | 'confirm') => void;
  close: () => void;
  coin?: ERC20Type | null;
  onConfirm: () => void;
  transactionAmount: any;
  setTransactionAmount: any;
  transactionRecipient: any;
  setTransactionRecipient: any;
  uqbarContract: boolean;
  to: string | undefined;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
};

export const TransactionPane = ({
  protocol,
  network,
  ethereum,
  currentWallet,
  navigate,
  screen,
  max,
  onScreenChange,
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

  const next = () => {
    if (protocol === ProtocolType.UQBAR) {
      // enqueueUqbarTransaction(
      //   walletIndex ?? '',
      //   transactionAmount
      // );
    } else {
      const wallet = currentWallet;
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
      onScreenChange('confirm');
    }
  };

  const prev = () => {
    navigate(WalletScreen.TRANSACTION_SEND);
    onScreenChange('initial');
  };

  const amountValidator = (valid: boolean, amount?: number) => {
    setAmountValid(valid);
    if (valid) {
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
                  <Flex justifyContent="center">
                    <Flex>
                      {!transactionRecipient.patp &&
                        transactionRecipient.address && (
                          <Flex flexDirection="column" justifyContent="center">
                            <Icon name="Spy" size="24px" />
                            <Text.Body variant="body">
                              {shortened(transactionRecipient.address)}
                            </Text.Body>
                          </Flex>
                        )}
                      {transactionRecipient.patp &&
                        transactionRecipient.address && (
                          <Flex gap={8} alignItems="center">
                            <Avatar
                              sigilColor={[
                                transactionRecipient.color || 'black',
                                'white',
                              ]}
                              simple={true}
                              size={24}
                              patp={transactionRecipient.patp}
                            />{' '}
                            <Flex
                              flexDirection="column"
                              justifyContent="center"
                            >
                              <Text.Body variant="body">
                                {transactionRecipient.patp}
                              </Text.Body>
                              <Text.Body variant="body">
                                {shortened(transactionRecipient.address)}
                              </Text.Body>
                            </Flex>
                          </Flex>
                        )}
                    </Flex>
                  </Flex>
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
