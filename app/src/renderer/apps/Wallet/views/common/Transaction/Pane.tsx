import { FC, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Box, Icons, Text, Sigil, Button } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { shortened, getBaseTheme } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { RecipientInput } from './RecipientInput';
import { AmountInput } from './AmountInput';
import {
  ProtocolType,
  ERC20Type,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { Avatar } from '@holium/design-system';

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
    const { walletApp } = useTrayApps();

    const screen =
      walletApp.navState.view === WalletView.TRANSACTION_SEND
        ? 'initial'
        : 'confirm';

    const [amountValid, setAmountValid] = useState(false);

    const [recipientValid, setRecipientValid] = useState(false);

    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

    const next = () => {
      if (walletApp.navState.protocol === ProtocolType.UQBAR) {
        WalletActions.enqueueUqbarTransaction(
          walletApp.navState.walletIndex!,
          props.transactionAmount
        );
      } else {
        const wallet = walletApp.currentWallet!;
        WalletActions.navigate(WalletView.TRANSACTION_CONFIRM, {
          walletIndex: `${wallet.index!}`,
          protocol: walletApp.navState.protocol,
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
      WalletActions.navigate(WalletView.TRANSACTION_SEND);
      props.onScreenChange('initial');
    };

    const amountValidator = (valid: boolean, amount?: number) => {
      setAmountValid(valid);
      if (valid) {
        props.setTransactionAmount(amount!);
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
          <Flex mt={7} flexDirection="column">
            <AmountInput
              max={props.max}
              coin={props.coin}
              setValid={amountValidator}
            />
            <Box width="100%" mt={4}>
              <RecipientInput setValid={recipientValidator} />
            </Box>
            <Flex mt={7} justifyContent="space-between">
              <Button variant="transparent" onClick={() => props.close()}>
                Cancel
              </Button>
              <Button
                px={4}
                disabled={!recipientValid || !amountValid}
                onClick={next}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex mt={7} flexDirection="column">
            {!props.uqbarContract && (
              <>
                <Text
                  opacity={0.9}
                  fontWeight={600}
                  fontSize={7}
                  animate={false}
                >
                  {props.transactionAmount}{' '}
                  {props.coin
                    ? props.coin.name
                    : walletApp.navState.protocol === ProtocolType.UQBAR
                    ? 'zigs'
                    : abbrMap[walletApp.navState.network]}
                </Text>
                {walletApp.navState.protocol === ProtocolType.ETH_MAIN && (
                  <Text mt={1} color={themeData.colors.text.disabled}>
                    $
                    {ethToUsd(
                      props.transactionAmount,
                      walletApp.ethereum.conversions.usd!
                    )}{' '}
                    USD
                  </Text>
                )}
                <Flex
                  mt={7}
                  width="100%"
                  flexDirection="column"
                  justifyContent="space-evenly"
                  alignItems="center"
                >
                  <Flex width="100%" justifyContent="space-between">
                    <Text
                      variant="body"
                      color={themeData.colors.text.secondary}
                    >
                      TO
                    </Text>
                    <Flex justifyContent="center">
                      <Flex mr={2}>
                        {!props.transactionRecipient.patp &&
                          props.transactionRecipient.address && (
                            <Flex
                              flexDirection="column"
                              justifyContent="center"
                            >
                              <Icons
                                name="Spy"
                                size="24px"
                                color={themeData.colors.text.secondary}
                              />
                              <Text variant="body">
                                {shortened(props.transactionRecipient.address)}
                              </Text>
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
                                patp={props.transactionRecipient.patp!}
                              />{' '}
                              <Flex
                                flexDirection="column"
                                justifyContent="center"
                              >
                                <Text variant="body">
                                  {props.transactionRecipient.patp}
                                </Text>
                                <Text
                                  variant="body"
                                  color={themeData.colors.text.tertiary}
                                >
                                  {shortened(
                                    props.transactionRecipient.address
                                  )}
                                </Text>
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
                  <Flex mt={5} width="100%" justifyContent="space-between">
                    <Text
                      variant="body"
                      color={themeData.colors.text.secondary}
                    >
                      NETWORK FEE
                    </Text>
                    <Flex flexDirection="column">
                      <Text variant="body">0.001 ETH</Text>
                      {walletApp.navState.protocol ===
                        ProtocolType.ETH_MAIN && (
                        <Text
                          fontSize={1}
                          color={themeData.colors.text.secondary}
                        >
                          ≈{' '}
                          {ethToUsd(
                            0.0005,
                            walletApp.ethereum.conversions.usd!
                          )}{' '}
                          USD
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                  <Flex mt={5} width="100%" justifyContent="space-between">
                    <Text
                      variant="body"
                      color={themeData.colors.text.secondary}
                    >
                      TOTAL
                    </Text>
                    <Flex flexDirection="column">
                      <Text variant="body">
                        {props.transactionAmount + 0.0005}{' '}
                        {props.coin ? props.coin.name : 'ETH'}
                      </Text>
                      {walletApp.navState.protocol ===
                        ProtocolType.ETH_MAIN && (
                        <Text
                          fontSize={1}
                          color={themeData.colors.text.secondary}
                        >
                          ≈{' '}
                          {ethToUsd(
                            props.transactionAmount + 0.0005,
                            walletApp.ethereum.conversions.usd!
                          )}{' '}
                          USD
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </>
            )}
            <Flex mt={7} justifyContent="space-between">
              <Button variant="transparent" onClick={() => prev()}>
                Reject
              </Button>
              <Button
                px={2}
                onClick={props.onConfirm} // sendTransaction}
              >
                Confirm
              </Button>
            </Flex>
          </Flex>
        )}
      </>
    );
  }
);
