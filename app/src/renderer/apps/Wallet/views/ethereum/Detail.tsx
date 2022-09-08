import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { theme as themes } from 'renderer/theme';
import { darken, lighten, transparentize } from 'polished';
import {QRCodeSVG} from 'qrcode.react';

import { Flex, Box, Icons, Text } from 'renderer/components';
import { CircleButton } from '../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { shortened, formatWei, convertWeiToUsd, monthNames } from '../../lib/helpers';

interface EthDetailProps {
  theme: ThemeModelType
}

interface Transaction {
  type: string,
  address: string,
  amount: string,
  date: Date
}

export const EthDetail: FC<EthDetailProps> = observer((props: EthDetailProps) => {
  const { walletApp, dimensions, setTrayAppDimensions } = useTrayApps();
  const { desktop } = useServices();
  const [qr, setQr] = useState(false);

  const transactions = [
    {
      type: 'sent',
      address: '0xB017058f7De4efF370AC8bF0c84906BEC3d0b2CE',
      amount: '320057483850000000',
      date: new Date('8/10/2022')
    },
    {
      type: 'received',
      address: '0xD299058f7De4efF370AC8bF0c84906BEC3d0b2CE',
      amount: '148392948570000000',
      date: new Date('8/2/2022')
    },
    {
      type: 'received',
      address: '0xC122058f7De4efF370AC8bF0c84906BEC3d0b2CE',
      amount: '923424554340000000',
      date: new Date('7/11/2022')
    },
  ]

  /* @ts-ignore */
  const theme = themes[desktop.theme.mode === 'light' ? 'light' : 'dark'];
  const wallet = walletApp.ethereum.wallets.get(walletApp.currentAddress!);

  const panelBackground = darken(0.04, props.theme!.windowColor);
  const panelBorder = darken(0.08, props.theme!.windowColor);
  const abbrMap = {
    ethereum: 'ETH',
    bitcoin: 'BTC',
  };

  useEffect(() => {
    let prevDims = dimensions;
    console.log(prevDims.height, prevDims.width)
    setTrayAppDimensions({ height: 520, width: 320 });

    return () => {
      setTrayAppDimensions(prevDims);
    }
  }, [])

  const CopyButton: FC<{ content: string}> = (props: { content: string }) => {
    const [copied, setCopied] = useState(false);

    function copy() {
      navigator.clipboard.writeText(props.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 750);
    }

    return (
      <Box>
        { !copied
            ? (
              <Box onClick={copy}>
                <Icons name="Copy" height="20px" color={theme.colors.text.tertiary} />
              </Box>
            )
            : <Icons name="CheckCircle" height="20px" color={theme.colors.ui.intent.success} />
        }
      </Box>
    )
  }

  interface WalletInfoProps { qr: boolean, onClick: React.MouseEventHandler }
  const WalletInfo: FC<WalletInfoProps> = (props: WalletInfoProps) => {
    let { qr, onClick } = props;
    return (
      <Flex p={2} width="100%"
            background={darken(.03, desktop.theme.windowColor)} border={`solid 1px ${panelBorder}`} borderRadius="8px"
            flexDirection="column" justifyContent="center" alignItems="center">
        <Flex width="100%" justifyContent="space-between">
          <Flex>
            <Icons name="Ethereum" height="20px" mr={2} />
            <Text pt="2px" textAlign="center" fontSize="14px">{shortened(wallet!.address)}</Text>
          </Flex>
          <Flex>
            <CopyButton content={wallet!.address} />
            <Box onClick={onClick}>
              <Icons ml={2} name="QRCode" height="20px" color={qr ? theme.colors.brand.primary : theme.colors.text.tertiary} />
            </Box>
          </Flex>
        </Flex>
        <Box width="100%" hidden={!qr}>
          <Flex mt={1} p={3} width="100%" height="200px" justifyContent="center" alignItems="center">
              <QRCodeSVG width="100%" height="100%" value={wallet!.address} />
          </Flex>
        </Box>
      </Flex>
    )
  }

  interface TransactionProps {
    transaction: Transaction
  }
  const Transaction: FC<TransactionProps> = (props: TransactionProps) => {
    const { transaction } = props;

    return (
      <Flex pt={2} width="100%" justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" justifyContent="center">
          <Text variant="h5" fontSize={3}>{transaction.type === 'received' ? 'Received ETH' : 'Sent ETH' }</Text>
          <Flex>
            <Text variant="body" fontSize={1} color="text.success">
              {`${monthNames[transaction.date.getMonth()]} ${transaction.date.getDate()}`}
            </Text>
            <Text mx={1} variant="body" fontSize={1} color="text.disabled">·</Text>
            <Text variant="body" fontSize={1} color="text.disabled">To: {shortened(transaction.address)}</Text>
          </Flex>
        </Flex>
        <Flex flexDirection="column" justifyContent="center" alignItems="flex-end">
          <Text variant="body" fontSize={2}>{transaction.type === 'sent' ? '-' : ''} {formatWei(transaction.amount)} ETH</Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            {transaction.type === 'sent' ? '-' : ''}${convertWeiToUsd(transaction.amount)} USD
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex width="100%" height="100%" flexDirection="column" p={3}>
      { /* @ts-ignore */ }
      <Flex p={3} width="100%" flexDirection="column" background={lighten(.02, desktop.theme.windowColor)} boxShadow="0px 0px 9px rgba(0, 0, 0, 0.12)" borderRadius="16px">
        <WalletInfo qr={qr} onClick={() => setQr(!qr)} />
        <Box pt={2}>
          <Text
            mt={3}
            opacity={0.5}
            fontWeight={600}
            color={theme.colors.text.tertiary}
            style={{ textTransform: 'uppercase' }}
            animate={false}
          >
            Wallet 1
          </Text>
          <Text
            opacity={0.9}
            fontWeight={600}
            fontSize={7}
            animate={false}
          >
            {/* @ts-ignore */}
            {wallet.balance} {abbrMap[wallet.network]}
          </Text>
        </Box>
        <Flex mt="18px" width="100%" justifyContent="center" alignItems="center">
          <Box mr="16px">
            <CircleButton icon="Receive" title="Receive" iconColor={panelBackground} />
          </Box>
          <Box>
            <CircleButton icon="Send" title="Send" iconColor={panelBackground} />
          </Box>
        </Flex>
      </Flex>
      <Box width="100%" hidden={qr}>
        <Flex width="100%" pt={6} flexDirection="column" justifyContent="center">
          <Box pb={1}>
            <Text variant="body" fontSize={2} color="text.tertiary">Transactions</Text>
          </Box>
          { transactions.map((transaction, index) => <Transaction key={index} transaction={transaction} />) }
        </Flex>
      </Box>
    </Flex>
  );
});
