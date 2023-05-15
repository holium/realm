import { useState } from 'react';
import { observer } from 'mobx-react';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';
import { shortened } from 'renderer/apps/Wallet/helpers';
import { WalletScreen } from 'renderer/apps/Wallet/types';
import { ERC20Type } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { AmountInput } from './AmountInput';
import { RecipientInput } from './RecipientInput';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

const ethToUsd = (eth: number, currentPrice: number) =>
  isNaN(eth) ? 0 : (eth * currentPrice).toFixed(2);

type Props = {
  max: number;
  onScreenChange: any;
  close: any;
  coin?: ERC20Type | null;
  onConfirm: any;
  transactionAmount: any;
  setTransactionAmount: any;
  transactionRecipient: any;
  setTransactionRecipient: any;
  uqbarContract: boolean;
};

const TransactionPanePresenter = ({
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
}: Props) => {
  const { walletStore } = useShipStore();

  const screen =
    walletStore.navState.view === WalletScreen.TRANSACTION_SEND
      ? 'initial'
      : 'confirm';

  const [amountValid, setAmountValid] = useState(false);

  const [recipientValid, setRecipientValid] = useState(false);

  const next = () => {
    if (walletStore.navState.protocol === ProtocolType.UQBAR) {
      // walletStore.enqueueUqbarTransaction(
      //   walletStore.navState.walletIndex ?? '',
      //   transactionAmount
      // );
    } else {
      const wallet = walletStore.currentWallet;
      walletStore.navigate(WalletScreen.TRANSACTION_CONFIRM, {
        walletIndex: `${wallet?.index}`,
        protocol: walletStore.navState.protocol,
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
    walletStore.navigate(WalletScreen.TRANSACTION_SEND);
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
          <AmountInput max={max} coin={coin} setValid={amountValidator} />
          <Box width="100%">
            <RecipientInput setValid={recipientValidator} />
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
                  : walletStore.navState.protocol === ProtocolType.UQBAR
                  ? 'zigs'
                  : abbrMap[walletStore.navState.network]}
              </Text.Body>
              {walletStore.navState.protocol === ProtocolType.ETH_MAIN && (
                <Text.Body>
                  $
                  {ethToUsd(
                    transactionAmount,
                    walletStore.ethereum.conversions.usd ?? 0
                  )}{' '}
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
                    {/* <Flex flexDirection="column" justifyContent="center">
      {transactionRecipient.address ? (
        <Text variant="body">
          {shortened(transactionRecipient.address)}
        </Text>
      ) : (
        <>
          <Text variant="body">{transactionRecipient.patp}</Text>
          <Text
            variant="body"
            color={themeData.colors.text.tertiary}
          >
            {shortened(
              `0xE96E2181F6166A37EA4C04F6E6E2bD672D72Acc1`
            )}
          </Text>
        </>
      )}
    </Flex> */}
                  </Flex>
                </Flex>
                <Flex width="100%" justifyContent="space-between">
                  <Text.Body variant="body">NETWORK FEE</Text.Body>
                  <Flex flexDirection="column">
                    <Text.Body variant="body">0.001 ETH</Text.Body>
                    {walletStore.navState.protocol ===
                      ProtocolType.ETH_MAIN && (
                      <Text.Body fontSize={1}>
                        ≈{' '}
                        {ethToUsd(
                          0.0005,
                          walletStore.ethereum.conversions.usd ?? 0
                        )}{' '}
                        USD
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
                    {walletStore.navState.protocol ===
                      ProtocolType.ETH_MAIN && (
                      <Text.Body fontSize={1}>
                        ≈{' '}
                        {ethToUsd(
                          transactionAmount + 0.0005,
                          walletStore.ethereum.conversions.usd ?? 0
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

export const TransactionPane = observer(TransactionPanePresenter);
