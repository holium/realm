import { FC, useState } from 'react';
import { Avatar, Box, Button, Flex, Icon, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { shortened } from 'renderer/apps/Wallet/lib/helpers';
import {
  ERC20Type,
  ProtocolType,
  WalletView,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { AmountInput } from './AmountInput';
import { RecipientInput } from './RecipientInput';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

const ethToUsd = (eth: number, currentPrice: number) =>
  isNaN(eth) ? 0 : (eth * currentPrice).toFixed(2);

interface TransactionPaneProps {
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
}

export const TransactionPane: FC<TransactionPaneProps> = observer(
  (props: TransactionPaneProps) => {
    const { coin } = props;
    const { walletStore } = useShipStore();

    const screen =
      walletStore.navState.view === WalletView.TRANSACTION_SEND
        ? 'initial'
        : 'confirm';

    const [amountValid, setAmountValid] = useState(false);

    const [recipientValid, setRecipientValid] = useState(false);

    const next = () => {
      if (walletStore.navState.protocol === ProtocolType.UQBAR) {
        walletStore.enqueueUqbarTransaction(
          walletStore.navState.walletIndex ?? '',
          props.transactionAmount
        );
      } else {
        const wallet = walletStore.currentWallet;
        walletStore.navigate(WalletView.TRANSACTION_CONFIRM, {
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
        props.onScreenChange('confirm');
      }
    };

    const prev = () => {
      walletStore.navigate(WalletView.TRANSACTION_SEND);
      props.onScreenChange('initial');
    };

    const amountValidator = (valid: boolean, amount?: number) => {
      setAmountValid(valid);
      if (valid) {
        props.setTransactionAmount(amount);
      }
    };

    const recipientValidator = (
      valid: boolean,
      recipient: { address?: string; patp?: string; patpAddress?: string }
    ) => {
      setRecipientValid(valid);
      if (valid) {
        props.setTransactionRecipient(recipient);
      }
    };

    return (
      <>
        {screen === 'initial' ? (
          <Flex flexDirection="column">
            <AmountInput
              max={props.max}
              coin={props.coin}
              setValid={amountValidator}
            />
            <Box width="100%">
              <RecipientInput setValid={recipientValidator} />
            </Box>
            <Flex justifyContent="space-between">
              <Button.TextButton
                variant="transparent"
                onClick={() => props.close()}
              >
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
            {!props.uqbarContract && (
              <>
                <Text.Body
                  opacity={0.9}
                  fontWeight={600}
                  fontSize={7}
                  animate={false}
                >
                  {props.transactionAmount}{' '}
                  {props.coin
                    ? props.coin.name
                    : walletStore.navState.protocol === ProtocolType.UQBAR
                    ? 'zigs'
                    : abbrMap[walletStore.navState.network]}
                </Text.Body>
                {walletStore.navState.protocol === ProtocolType.ETH_MAIN && (
                  <Text.Body>
                    $
                    {ethToUsd(
                      props.transactionAmount,
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
                        {!props.transactionRecipient.patp &&
                          props.transactionRecipient.address && (
                            <Flex
                              flexDirection="column"
                              justifyContent="center"
                            >
                              <Icon name="Spy" size="24px" />
                              <Text.Body variant="body">
                                {shortened(props.transactionRecipient.address)}
                              </Text.Body>
                            </Flex>
                          )}
                        {props.transactionRecipient.patp &&
                          props.transactionRecipient.address && (
                            <Flex gap={8} alignItems="center">
                              <Avatar
                                sigilColor={[
                                  props.transactionRecipient.color || 'black',
                                  'white',
                                ]}
                                simple={true}
                                size={24}
                                patp={props.transactionRecipient.patp}
                              />{' '}
                              <Flex
                                flexDirection="column"
                                justifyContent="center"
                              >
                                <Text.Body variant="body">
                                  {props.transactionRecipient.patp}
                                </Text.Body>
                                <Text.Body variant="body">
                                  {shortened(
                                    props.transactionRecipient.address
                                  )}
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
                        {props.transactionAmount + 0.0005}{' '}
                        {props.coin ? props.coin.name : 'ETH'}
                      </Text.Body>
                      {walletStore.navState.protocol ===
                        ProtocolType.ETH_MAIN && (
                        <Text.Body fontSize={1}>
                          ≈{' '}
                          {ethToUsd(
                            props.transactionAmount + 0.0005,
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
                onClick={props.onConfirm} // sendTransaction}
              >
                Confirm
              </Button.TextButton>
            </Flex>
          </Flex>
        )}
      </>
    );
  }
);
