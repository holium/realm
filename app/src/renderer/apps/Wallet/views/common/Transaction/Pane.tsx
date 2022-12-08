import { FC, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Box, Icons, Text, Sigil, Button } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { shortened, getBaseTheme } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { RecipientInput } from './RecipientInput';
import { AmountInput } from './AmountInput';
import { ERC20Type, NetworkType } from '@holium/realm-wallet/src/wallet.model';
import { ProtocolType } from '@holium/realm-wallet/src/wallet.model';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

const ethToUsd = (eth: number) => (isNaN(eth) ? 0 : (eth * 1715.66).toFixed(2));

interface TransactionPaneProps {
  max: number;
  onScreenChange: any;
  close: any;
  coin?: ERC20Type | null;
}

export const TransactionPane: FC<TransactionPaneProps> = observer(
  (props: TransactionPaneProps) => {
    const { walletApp } = useTrayApps();
    const [screen, setScreen] = useState('initial');
    const [transactionSending, setTransactionSending] = useState(false);

    const [amountValid, setAmountValid] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState(0);

    const [recipientValid, setRecipientValid] = useState(false);
    const [transactionRecipient, setTransactionRecipient] = useState<{
      address?: string;
      patp?: string;
      patpAddress?: string;
      color?: string;
    }>({});

    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

    const next = () => {
      setScreen('confirm');
      props.onScreenChange('confirm');
    };

    const prev = () => {
      setScreen('initial');
      props.onScreenChange('initial');
    };

    const sendTransaction = async () => {
      try {
        setTransactionSending(true);
        if (walletApp.navState.network === NetworkType.ETHEREUM) {
          props.coin
            ? await WalletActions.sendERC20Transaction(
                walletApp.currentWallet!.index.toString(),
                transactionRecipient.address ||
                  transactionRecipient.patpAddress!,
                transactionAmount.toString(),
                props.coin.address,
                transactionRecipient.patp
              )
            : await WalletActions.sendEthereumTransaction(
                walletApp.currentWallet!.index.toString(),
                transactionRecipient.address ||
                  transactionRecipient.patpAddress!,
                transactionAmount.toString(),
                transactionRecipient.patp
              );
        } else {
          await WalletActions.sendBitcoinTransaction(
            walletApp.currentWallet!.index,
            transactionRecipient.address || transactionRecipient.patpAddress!,
            transactionAmount.toString()
          );
        }
        setTransactionSending(false);
        setScreen('initial');
        props.close();
      } catch (e) {
        console.error(e);
        setTransactionSending(false);
      }
    };

    const amountValidator = (valid: boolean, amount?: number) => {
      setAmountValid(valid);
      if (valid) {
        setTransactionAmount(amount!);
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
            <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
              {transactionAmount}{' '}
              {props.coin
                ? props.coin.name
                : walletApp.navState.protocol === ProtocolType.UQBAR
                ? 'zigs'
                : abbrMap[walletApp.navState.network]}
            </Text>
            <Text mt={1} color={themeData.colors.text.disabled}>
              ${ethToUsd(transactionAmount)} USD
            </Text>
            <Flex
              mt={7}
              width="100%"
              flexDirection="column"
              justifyContent="space-evenly"
              alignItems="center"
            >
              <Flex width="100%" justifyContent="space-between">
                <Text variant="body" color={themeData.colors.text.secondary}>
                  TO
                </Text>
                <Flex justifyContent="center">
                  <Flex mr={2}>
                    {!transactionRecipient.patp &&
                      transactionRecipient.address && (
                        <Flex flexDirection="column" justifyContent="center">
                          <Icons
                            name="Spy"
                            size="24px"
                            color={themeData.colors.text.secondary}
                          />
                          <Text variant="body">
                            {shortened(transactionRecipient.address)}
                          </Text>
                        </Flex>
                      )}
                    {transactionRecipient.patp && transactionRecipient.address && (
                      <Flex gap={8} alignItems="center">
                        <Sigil
                          color={[
                            transactionRecipient.color || 'black',
                            'white',
                          ]}
                          simple={true}
                          size={24}
                          patp={transactionRecipient.patp!}
                        />{' '}
                        <Flex flexDirection="column" justifyContent="center">
                          <Text variant="body">
                            {transactionRecipient.patp}
                          </Text>
                          <Text
                            variant="body"
                            color={themeData.colors.text.tertiary}
                          >
                            {shortened(transactionRecipient.address)}
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
                <Text variant="body" color={themeData.colors.text.secondary}>
                  NETWORK FEE
                </Text>
                <Flex flexDirection="column">
                  <Text variant="body">
                    0.0005 {props.coin ? props.coin.name : 'ETH'}
                  </Text>
                  <Text fontSize={1} color={themeData.colors.text.secondary}>
                    ≈ {ethToUsd(0.0005)} USD
                  </Text>
                </Flex>
              </Flex>
              <Flex mt={5} width="100%" justifyContent="space-between">
                <Text variant="body" color={themeData.colors.text.secondary}>
                  TOTAL
                </Text>
                <Flex flexDirection="column">
                  <Text variant="body">
                    {transactionAmount + 0.0005}{' '}
                    {props.coin ? props.coin.name : 'ETH'}
                  </Text>
                  <Text fontSize={1} color={themeData.colors.text.secondary}>
                    ≈ {ethToUsd(transactionAmount + 0.0005)} USD
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex mt={7} justifyContent="space-between">
              <Button variant="transparent" onClick={() => prev()}>
                Reject
              </Button>
              <Button
                px={2}
                onClick={sendTransaction}
                isLoading={transactionSending}
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
