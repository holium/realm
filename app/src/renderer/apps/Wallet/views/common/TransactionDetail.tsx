import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeType } from 'renderer/theme';
import { darken, lighten, transparentize } from 'polished';

import {
  Flex,
  Text,
  Button,
  Icons,
  Sigil,
  Anchor,
  Spinner,
} from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import { WalletView } from 'os/services/tray/wallet.model';
import {
  shortened,
  fullMonthNames,
  getBaseTheme,
  formatEthAmount,
  formatBtcAmount,
  convertEthAmountToUsd,
  convertBtcAmountToUsd,
} from '../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import styled from 'styled-components';

interface TextAreaInput {
  theme: ThemeType;
  desktopTheme: ThemeModelType;
}
const TextArea = styled.textarea<TextAreaInput>`
  resize: none;
  height: 120px;
  width: 100%;
  padding: 12px;
  border: none;
  overflow: auto;
  outline: none;
  border-radius: 6px;
  color: ${(props) => props.theme.colors.text.primary};
  background-color: ${(props) =>
    darken(
      props.desktopTheme.mode === 'light' ? 0.05 : 0.02,
      props.desktopTheme.windowColor
    )};
  ::placeholder {
    color: ${(props) =>
      transparentize(
        props.desktopTheme.mode === 'light' ? 0.4 : 0.7,
        lighten(0.02, props.theme.colors.text.secondary)
      )};
  }
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
`;

export const TransactionDetail: FC = observer(() => {
  const { walletApp } = useTrayApps();
  let transaction = walletApp.ethereum.transactions.get(
    walletApp.currentItem.key
  )!;
  console.log(transaction);

  const { theme } = useServices();
  let themeData = getBaseTheme(theme.currentTheme);

  const [notes, setNotes] = useState(transaction.notes);
  const [loading, setLoading] = useState(false);

  let goBack = () => WalletActions.setView(walletApp.returnView! as WalletView);
  let saveNotes = () => {
    setLoading(true);
    WalletActions.saveTransactionNotes(notes);
    setLoading(false);
  };

  let wasSent = transaction.type === 'sent';
  let isEth = transaction.network === 'ethereum';
  let themDisplay =
    transaction.theirPatp || shortened(transaction.theirAddress);
  let initiated = new Date(transaction.initiatedAt);
  let ethAmount = formatEthAmount(isEth ? transaction.amount : '1');
  let btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1');
  let amountDisplay = isEth ? `${ethAmount.eth}`/* ETH`*/ : `${btcAmount.btc} BTC`;

  return (
    <Flex width="100%" height="100%" flexDirection="column" p={3}>
      <Text fontSize={1} color={themeData.colors.text.disabled}>
        Transaction
      </Text>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        {transaction.status === 'pending' ? (
          <Flex>
            <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
              Pending
            </Text>
            <Spinner
              ml={3}
              mt={1}
              size={1}
              color={themeData.colors.text.primary}
            />
          </Flex>
        ) : (
          <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
            {wasSent ? `Sent` : `Received`}
          </Text>
        )}
        <Flex
          mt="18px"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text
            variant="body"
            fontSize={4}
            color={
              wasSent
                ? themeData.colors.text.error
                : themeData.colors.text.success
            }
          >
            {wasSent && '-'} {amountDisplay}
          </Text>
          <Text
            variant="body"
            fontSize={2}
            color={themeData.colors.text.secondary}
          >
            $
            {isEth
              ? convertEthAmountToUsd(ethAmount)
              : convertBtcAmountToUsd(btcAmount)}
          </Text>
        </Flex>
      </Flex>
      <Flex mt={8} width="100%" justifyContent="space-between">
        <Text
          variant="body"
          fontSize={1}
          color={themeData.colors.text.secondary}
        >
          {wasSent ? 'SENT TO' : 'RECEIVED FROM'}
        </Text>
        <Flex alignItems="center">
          {!transaction.theirPatp ? (
            <Icons
              name="Spy"
              size="20px"
              color={themeData.colors.text.secondary}
            />
          ) : (
            <Sigil
              color={
                theme.currentTheme.mode === 'light'
                  ? ['black', 'white']
                  : ['white', 'black']
              }
              simple={true}
              size={20}
              patp={transaction.theirPatp!}
            />
          )}
          <Text variant="body" fontSize={1} ml={2}>
            {themDisplay}
          </Text>
        </Flex>
      </Flex>
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text
          variant="body"
          fontSize={1}
          color={themeData.colors.text.secondary}
        >
          DATE
        </Text>
        <Text variant="body" fontSize={1}>
          {fullMonthNames[initiated.getMonth()]} {initiated.getDate()}{' '}
          {initiated.getFullYear() !== new Date().getFullYear() &&
            `, ${initiated.getFullYear()}`}
        </Text>
      </Flex>
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text
          variant="body"
          fontSize={1}
          color={themeData.colors.text.secondary}
        >
          HASH
        </Text>
        <Flex position="relative" left="10px">
          <Anchor
            fontSize={1}
            color={themeData.colors.text.primary}
            href={`https://etherscan.io/tx/${transaction.hash}`}
          >
            {transaction.hash.slice(0, 12)}...{' '}
            <Icons mb={1} name="Link" size={1} />
          </Anchor>
        </Flex>
      </Flex>
      <Text
        mt={8}
        mb={2}
        ml={1}
        variant="body"
        color={themeData.colors.text.secondary}
        fontSize={1}
      >
        Notes
      </Text>
      <Flex width="100%" flexDirection="column" justifyContent="center">
        {/* @ts-ignore */}
        <TextArea
          theme={themeData}
          desktopTheme={theme.currentTheme}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Transaction notes..."
        />
        <Flex mt={4} width="100%" justifyContent="flex-end">
          <Button
            width="100%"
            disabled={notes === transaction.notes}
            isLoading={loading}
            onClick={saveNotes}
          >
            Save notes
          </Button>
        </Flex>
      </Flex>
      <Flex position="absolute" top="542px" zIndex={999} onClick={goBack}>
        <Icons
          name="ArrowLeftLine"
          size={2}
          color={theme.currentTheme.iconColor}
        />
      </Flex>
    </Flex>
  );
});
