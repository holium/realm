import { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import {
  Box,
  Button,
  Flex,
  Icon,
  Row,
  Text,
} from '@holium/design-system/general';
import { TrayApp } from '@holium/design-system/os';

import { WalletCardStyle } from '../WalletCard';

type ChatAppProps = {
  isOpen: boolean;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  closeTray: () => void;
};

const position = 'top-left';
const anchorOffset = { x: -8, y: 24 };
// const anchorOffset = { x: 0, y: 0 }
const dimensions = { height: 550, width: 350 };

export const walletConfig = {
  position,
  anchorOffset,
  dimensions,
};

type ListTypes = 'coins' | 'transactions' | 'nft';

export const WalletApp = ({
  isOpen = false,
  closeTray,
  coords,
}: ChatAppProps) => {
  const wallet = {
    address: '0xfc43f5f9dd45258b3AFf31Bdbe6561D97e8B71de',
    nickname: 'My Wallet',
    balance: 100,
    coins: [],
    transactions: [
      {
        date: 'Feb 10',
        from: '~tadwet-pilwyd',
        amount: '0.0450',
        amountUSD: '68.97',
        type: 'Received',
      },
      {
        date: 'Feb 5',
        to: '~fasnut-famden',
        amount: '0.0025',
        amountUSD: '3.83',
        type: 'Sent',
      },
      {
        date: 'Feb 1',
        to: '~lodlev-migdev',
        amount: '0.01',
        amountUSD: '15.33',
        type: 'Sent',
      },
      {
        date: 'Feb 1',
        from: '~zod',
        amount: '2.40',
        amountUSD: '3633.19',
        type: 'Received',
      },
    ],
  };
  const [listType, setListType] = useState<ListTypes>('transactions');

  return (
    <TrayApp
      id="wallet"
      className="hideonmobile"
      isOpen={isOpen}
      coords={coords}
      closeTray={closeTray}
    >
      <Flex
        width="100%"
        height="100%"
        justifyContent="flex-start"
        flexDirection="column"
        py={1}
        pb={0}
      >
        <WalletCard wallet={wallet} />
        <ListSelector
          selected={listType}
          onChange={(type: string) => {
            setListType(type as ListTypes);
          }}
        />
        {listType === 'transactions' &&
          wallet.transactions.map((transaction: any) => {
            return <Transaction {...transaction} />;
          })}
      </Flex>
    </TrayApp>
  );
};

const walletCardStyleTransition = {
  duration: 0.1,
  layout: { duration: 0.1, ease: 'easeInOut' },
};

type WalletCardProps = {
  wallet: any;
};

export function shortened(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const WalletAddress = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  border-radius: 9px;
  border: 1px solid var(--rlm-border-color);
  background: var(--rlm-input-color);
  padding: 6px 8px;
`;

const WalletCard = ({ wallet }: WalletCardProps) => {
  const coins = wallet.coins;
  const [QROpen, setQROpen] = useState(false);

  return (
    <WalletCardStyle
      layout="size"
      layoutId={`wallet-card-${wallet.address}`}
      justifyContent="flex-start"
      transition={walletCardStyleTransition}
    >
      <WalletAddress>
        <Flex alignItems="center">
          <Icon name="Ethereum" height="20px" mr={2} />
          <Text.Custom px={1} py={1} textAlign="center" fontSize="15px">
            {shortened(wallet.address)}
          </Text.Custom>
        </Flex>
        <Flex>
          <CopyButton />
          <Box onClick={() => setQROpen(!QROpen)}>
            <Icon ml={2} name="QRCode" height="20px" opacity={0.5} />
          </Box>
        </Flex>
      </WalletAddress>
      <Text.Custom
        mt={3}
        layoutId={`wallet-name-${wallet.address}`}
        layout="position"
        transition={{ duration: 0.1 }}
        fontWeight={700}
        style={{ textTransform: 'uppercase', opacity: 0.5 }}
      >
        Address 1
      </Text.Custom>
      <Text.Custom
        layoutId={`wallet-balance-${wallet.address}`}
        transition={{ duration: 0.1 }}
        fontWeight={700}
        fontSize="28px"
      >
        2.345 ETH
      </Text.Custom>
      <Text.Custom
        layout="position"
        layoutId={`wallet-usd-${wallet.address}`}
        transition={walletCardStyleTransition}
        style={{ opacity: 0.5 }}
        fontSize="14px"
      >
        $3,485.50 USD
      </Text.Custom>
      <Flex
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        pt={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex>
          {coins &&
            coins
              .slice(0, 6)
              .map((coin: any, index: number) => (
                <img
                  alt={coin.name}
                  src={coin.logo}
                  style={{ height: '14px', marginRight: '4px' }}
                  key={index}
                />
              ))}
          {coins && coins.length > 6 && (
            <Text.Custom ml={1}>+{coins.length - 6}</Text.Custom>
          )}
        </Flex>
      </Flex>
      <Box width="100%">
        <Flex
          mt="12px"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Flex flexDirection="column" mr="16px" alignItems="center">
            <CircleBtn style={{ pointerEvents: 'none' }}>
              <Icon name="Receive" size="22px" />
            </CircleBtn>
            <Text.Custom mt={1} color="accent" fontWeight={300} fontSize={1}>
              Receive
            </Text.Custom>
          </Flex>
          <Flex flexDirection="column" alignItems="center">
            <CircleBtn style={{ pointerEvents: 'none' }}>
              <Icon name="Send" size="22px" />
            </CircleBtn>
            <Text.Custom mt={1} color="accent" fontWeight={300} fontSize={1}>
              Send
            </Text.Custom>
          </Flex>
        </Flex>
      </Box>
    </WalletCardStyle>
  );
};

const CircleBtn = styled(motion.div)`
  border-radius: 50%;
  height: 32px;
  width: 32px;
  cursor: pointer;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--rlm-accent-color);
`;

function CopyButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText('this is a fake address');
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  };

  return (
    <Box>
      {!copied ? (
        <Box onClick={copy}>
          <Icon name="Copy" height="20px" opacity={0.5} />
        </Box>
      ) : (
        <Icon name="CheckCircle" height="20px" />
      )}
    </Box>
  );
}

interface ListSelectorProps {
  selected: any;
  onChange: any;
}
function ListSelector(props: ListSelectorProps) {
  const MenuButton = (props: any) => {
    return props.selected ? (
      <Button.TextButton
        style={{ pointerEvents: 'none' }}
        onClick={props.onClick}
        fontWeight={500}
      >
        {props.children}
      </Button.TextButton>
    ) : (
      <Button.TextButton
        style={{ pointerEvents: 'none' }}
        onClick={props.onClick}
        color="text"
        showOnHover
        opacity={0.5}
        fontWeight={500}
      >
        {props.children}
      </Button.TextButton>
    );
  };
  return (
    <Flex mt={3} gap={4} mb={2} alignItems="center">
      <MenuButton
        selected={props.selected === 'transactions'}
        onClick={(evt: any) => {
          evt.stopPropagation();
          props.onChange('transactions');
        }}
      >
        Transactions
      </MenuButton>
      <MenuButton
        selected={props.selected === 'coins'}
        onClick={(evt: any) => {
          evt.stopPropagation();
          props.onChange('coins');
        }}
      >
        Coins
      </MenuButton>
      <MenuButton
        selected={props.selected === 'nfts'}
        onClick={(evt: any) => {
          evt.stopPropagation();
          props.onChange('nfts');
        }}
      >
        NFTs
      </MenuButton>
    </Flex>
  );
}

type TransactionProps = {
  date: string;
  to: string;
  from: string;
  amount: string;
  amountUSD: string;
  type: 'Sent' | 'Received';
};

export const Transaction = ({
  type,
  to,
  from,
  amount,
  amountUSD,
  date,
}: TransactionProps) => {
  return (
    <Row style={{ pointerEvents: 'none', padding: '6px 8px' }} borderRadius={9}>
      <Flex width="100%" justifyContent="space-between" alignItems="center">
        <Flex
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
        >
          <Text.Custom textAlign="left" fontWeight={500} fontSize={2}>
            {type}
          </Text.Custom>
          <Flex justifyContent="flex-start">
            <Text.Custom
              variant="body"
              fontSize={1}
              color={type === 'Sent' ? 'intent-alert' : 'intent-success'}
              textAlign="left"
            >
              {date}
            </Text.Custom>
            <Text.Custom mx={1} fontSize={1} opacity={0.5}>
              ·
            </Text.Custom>
            <Text.Custom
              textAlign="left"
              truncate
              width={130}
              fontSize={1}
              opacity={0.5}
              justifyContent="flex-start"
            >
              {type === 'Sent' ? `To: ${to}` : `From: ${from}`}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text.Body fontSize={2}>
            {type === 'Sent' ? '-' : ''} {amount}
          </Text.Body>
          <Text.Hint opacity={0.5}>
            {type === 'Sent' ? '-' : ''}${amountUSD} USD
          </Text.Hint>
        </Flex>
      </Flex>
    </Row>
  );
};
