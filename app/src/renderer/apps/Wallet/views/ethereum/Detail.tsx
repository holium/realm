import { FC, useEffect, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { theme as themes } from 'renderer/theme';
import { darken, lighten, transparentize } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Icons, Text, Sigil, Button } from 'renderer/components';
import { CircleButton } from '../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import {
  shortened,
  formatWei,
  convertWeiToUsd,
  monthNames,
} from '../../lib/helpers';

interface EthDetailProps {
  theme: ThemeModelType;
}

interface Transaction {
  type: string;
  amount: string;
  date: Date;
  address: string;
}

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

const transactions = [
  {
    type: 'sent',
    address: '0xB017058f7De4efF370AC8bF0c84906BEC3d0b2CE',
    amount: '320057483850000000',
    date: new Date('8/10/2022'),
  },
  {
    type: 'received',
    address: '0xD299058f7De4efF370AC8bF0c84906BEC3d0b2CE',
    amount: '148392948570000000',
    date: new Date('8/2/2022'),
  },
  {
    type: 'received',
    address: '0xC122058f7De4efF370AC8bF0c84906BEC3d0b2CE',
    amount: '923424554340000000',
    date: new Date('7/11/2022'),
  },
];

const Input = styled.input`
  -webkit-appearance: none;
  width: ${(props) => (props.width ? props.width : '100px;')};
  background-color: inherit;
  border: 0;
  outline: none;
  caret-color: transparent;
  :focus {
    outline: none !important;
  }
`;

const FlexHider = styled(Flex)`
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const CopyButton: FC<{ content: string }> = (props: { content: string }) => {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(props.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  }

  return (
    <Box>
      {!copied ? (
        <Box onClick={copy}>
          <Icons name="Copy" height="20px" color={theme.colors.text.tertiary} />
        </Box>
      ) : (
        <Icons
          name="CheckCircle"
          height="20px"
          color={theme.colors.ui.intent.success}
        />
      )}
    </Box>
  );
};

const WalletInfo: FC<{ hideWalletHero: boolean }> = (props: {
  hideWalletHero: boolean;
}) => {
  return (
    <Flex
      p={2}
      width="100%"
      background={darken(0.03, theme.currentTheme.windowColor)}
      border={`solid 1px ${panelBorder}`}
      borderRadius="8px"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Flex width="100%" justifyContent="space-between">
        <Flex>
          <Icons name="Ethereum" height="20px" mr={2} />
          <Text pt="2px" textAlign="center" fontSize="14px">
            {shortened(wallet!.address)}
          </Text>
        </Flex>
        <Flex>
          <CopyButton content={wallet!.address} />
          <Box onClick={() => setQROpen(!QROpen)}>
            <Icons
              ml={2}
              name="QRCode"
              height="20px"
              color={
                QROpen ? theme.colors.brand.primary : theme.colors.text.tertiary
              }
            />
          </Box>
        </Flex>
      </Flex>
      <Box width="100%" hidden={!QROpen}>
        <Flex
          mt={1}
          p={3}
          width="100%"
          height="200px"
          justifyContent="center"
          alignItems="center"
        >
          <QRCodeSVG width="100%" height="100%" value={wallet!.address} />
        </Flex>
      </Box>
      <Box p={2} width="100%" hidden={props.hideWalletHero}>
        <Text
          mt={3}
          opacity={0.5}
          fontWeight={600}
          color={theme.colors.text.tertiary}
          style={{ textTransform: 'uppercase' }}
          animate={false}
        >
          {wallet!.nickname}
        </Text>
        <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
          {/* @ts-ignore */}
          {wallet.balance} {abbrMap[wallet.network]}
        </Text>
      </Box>
    </Flex>
  );
};

const SendReceiveButtons: FC = () => (
  <Box width="100%" hidden={sendTrans}>
    <Flex mt="18px" width="100%" justifyContent="center" alignItems="center">
      <Box mr="16px" onClick={() => setQROpen(true)}>
        <CircleButton
          icon="Receive"
          title="Receive"
          iconColor={panelBackground}
        />
      </Box>
      <Box onClick={() => setSendTrans(true)}>
        <CircleButton icon="Send" title="Send" iconColor={panelBackground} />
      </Box>
    </Flex>
  </Box>
);

interface TransactionProps {
  transaction: Transaction;
}
const Transaction: FC<TransactionProps> = (props: TransactionProps) => {
  const { transaction } = props;

  return (
    <Flex
      pt={2}
      width="100%"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex flexDirection="column" justifyContent="center">
        <Text variant="h5" fontSize={3}>
          {transaction.type === 'received' ? 'Received ETH' : 'Sent ETH'}
        </Text>
        <Flex>
          <Text variant="body" fontSize={1} color="text.success">
            {`${
              monthNames[transaction.date.getMonth()]
            } ${transaction.date.getDate()}`}
          </Text>
          <Text mx={1} variant="body" fontSize={1} color="text.disabled">
            ·
          </Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            To: {shortened(transaction.address)}
          </Text>
        </Flex>
      </Flex>
      <Flex
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-end"
      >
        <Text variant="body" fontSize={2}>
          {transaction.type === 'sent' ? '-' : ''}{' '}
          {formatWei(transaction.amount)} ETH
        </Text>
        <Text variant="body" fontSize={1} color="text.disabled">
          {transaction.type === 'sent' ? '-' : ''}$
          {convertWeiToUsd(transaction.amount)} USD
        </Text>
      </Flex>
    </Flex>
  );
};

const AmountInput = (props: {
  max: number;
  setValid: (valid: boolean, amount?: number) => void;
}) => {
  const [inCrypto, setInCrypto] = useState(true);
  const [amount, setAmount] = useState(0);
  const [amountError, setAmountError] = useState(false);

  console.log(props.max);

  let ethToUsd = (eth: number) => (isNaN(eth) ? 0 : (eth * 1715.66).toFixed(2));
  let usdToEth = (usd: number) =>
    isNaN(usd) ? 0 : (usd / 1715.66).toFixed(12);

  const check = (inCrypto: boolean, value: number) => {
    let amountInCrypto = inCrypto ? value : usdToEth(value);
    if (amountInCrypto > props.max) {
      setAmountError(true);
      return props.setValid(false);
    } else if (amountInCrypto === 0) {
      return props.setValid(false);
    } else {
      setAmountError(false);
      return props.setValid(true, value);
    }
  };

  const onChange = (e: any) => {
    let value: string = e.target.value;
    let isDecimal = value.includes('.');
    let decimalPlaces = isDecimal && value.split('.')[1].length;

    if (value.length > 10) return;

    if (!inCrypto && isDecimal && decimalPlaces > 2) return;

    check(inCrypto, Number(value));
    setAmount(Number(value));
  };

  const toggleInCrypto = () => {
    let toggled = !inCrypto;

    setInCrypto(toggled);
    check(toggled, amount);

    if (toggled === false) {
      setAmount(Number(amount.toFixed(2)));
    }
  };

  return (
    <Flex flexDirection="column">
      <FlexHider width="100%" justifyContent="space-evenly" alignItems="center">
        <Text fontSize={1} variant="body" color={theme.colors.text.secondary}>
          AMOUNT
        </Text>
        <Flex
          px={1}
          py={1}
          width="200px"
          height="40px"
          justifyContent="space-between"
          borderRadius="7px"
          background={panelBackground}
          border={`solid 1px ${
            amountError ? theme.colors.text.error : theme.colors.ui.borderColor
          }`}
        >
          <Flex
            pl="10px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
          >
            {inCrypto ? (
              <Input
                type="number"
                placeholder="0.00000000"
                value={amount || ''}
                onChange={onChange}
              />
            ) : (
              <Flex>
                <Text pt="2px" fontSize="12px">
                  $
                </Text>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount || ''}
                  onChange={onChange}
                />
              </Flex>
            )}
            <Box hidden={!amount}>
              <Text fontSize="11px" color={theme.colors.text.disabled}>
                {inCrypto
                  ? `$${ethToUsd(Number(amount))} USD`
                  : `${usdToEth(Number(amount))} ${
                      abbrMap[walletApp.network as 'bitcoin' | 'ethereum']
                    }`}
              </Text>
            </Box>
          </Flex>
          <Flex
            p="4px"
            justifyContent="center"
            alignItems="center"
            background={lighten(0.02, theme.currentTheme.windowColor)}
            border={`solid 1px ${theme.colors.ui.borderColor}`}
            borderRadius="5px"
            onClick={toggleInCrypto}
          >
            <Text mr={1} variant="body" fontSize="12px">
              {inCrypto
                ? abbrMap[walletApp.network as 'bitcoin' | 'ethereum']
                : 'USD'}
            </Text>
            <Icons name="UpDown" size="12px" />
          </Flex>
        </Flex>
      </FlexHider>
      <Box mt={2} ml="72px" width="100%">
        <Text variant="body" fontSize="11px" color={theme.colors.text.error}>
          {amountError && 'Amount greater than wallet balance.'}
        </Text>
      </Box>
    </Flex>
  );
};

const RecipientInput = (props: {
  setValid: (
    valid: boolean,
    recipient: { address?: string; patp?: string }
  ) => void;
}) => {
  const [icon, setIcon] = useState('blank');
  const [valueCache, setValueCache] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientError, setRecipientError] = useState('');

  const onChange = (e: any) => {
    let value: string = e.target.value;
    let validAddress =
      walletApp.network === 'ethereum' ? ethers.utils.isAddress(value) : false; // TODO add bitcoin validation
    let validPatp = isValidPatp(value);

    if (validAddress) {
      setIcon('spy');
      setValueCache(value);
      props.setValid(true, { address: value });
      return setRecipient(shortened(value));
    } else if (validPatp) {
      setIcon('sigil');
      setValueCache(value);
      props.setValid(true, { patp: value });
      // fetch contact/check address
    } else if (isValidPatp(`~${value}`)) {
      setIcon('sigil');
      setValueCache(`~${value}`);
      props.setValid(true, { patp: value });
      return setRecipient(`~${value}`);
    } else {
      setIcon('blank');
      setValueCache('');
      props.setValid(false, {});
    }

    setRecipient(value);
  };

  const RecipientIcon = (props: { icon: string }) => {
    let blankBg =
      theme.currentTheme.mode === 'light'
        ? lighten(0.1, theme.colors.text.disabled)
        : darken(0.04, theme.colors.text.disabled);
    if (props.icon === 'blank')
      return (
        <Box
          background={blankBg}
          height="24px"
          width="24px"
          borderRadius="5px"
        />
      );

    if (props.icon === 'spy')
      return (
        <Icons name="Spy" size="24px" color={theme.colors.text.secondary} />
      );

    if (props.icon === 'sigil')
      return (
        <Sigil
          color={['black', 'white']}
          simple={true}
          size={24}
          patp={valueCache!}
        />
      );

    return <></>;
  };

  return (
    <Flex width="100%" justifyContent="space-evenly" alignItems="center">
      <Text fontSize={1} variant="body" color={theme.colors.text.secondary}>
        TO
      </Text>
      <Flex
        px={1}
        py={1}
        width="240px"
        height="45px"
        borderRadius="7px"
        alignItems="center"
        background={panelBackground}
        border={`solid 1px ${
          recipientError ? theme.colors.text.error : theme.colors.ui.borderColor
        }`}
      >
        <Flex ml={1} mr={2}>
          <RecipientIcon icon={icon} />
        </Flex>
        <Input
          width="100%"
          placeholder="@p or recipient’s address"
          spellCheck="false"
          value={recipient}
          onChange={onChange}
        />
      </Flex>
    </Flex>
  );
};

const TransactionPane = (props: {
  max: number;
  setHideWalletHero: any;
  close: any;
}) => {
  const [screen, setScreen] = useState('initial');

  const [amountValid, setAmountValid] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);

  const [recipientValid, setRecipientValid] = useState(false);
  const [transactionRecipient, setTransactionRecipient] = useState<{
    address?: string;
    patp?: string;
  }>({});

  const next = () => {
    setHideWalletHero(true);
    setScreen('confirm');
  };

  const amountValidator = (valid: boolean, amount?: number) => {
    setAmountValid(valid);
    if (valid) {
      setTransactionAmount(amount!);
    }
  };

  const recipientValidator = (
    valid: boolean,
    recipient: { address?: string; patp?: string }
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
          <AmountInput max={props.max} setValid={amountValidator} />
          <Box width="100%" mt={4}>
            <RecipientInput setValid={recipientValidator} />
          </Box>
          <Flex mt={7} justifyContent="space-between">
            <Button variant="transparent" onClick={() => close()}>
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
        <Flex flexDirection="column">
          <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
            {/* @ts-ignore */}
            {transactionAmount} {abbrMap[wallet.network]}
          </Text>
        </Flex>
      )}
    </>
  );
};

interface SendTransactionProps {
  hidden: boolean;
  setHideWalletHero: any;
  close: () => void;
}
const SendTransaction: FC<SendTransactionProps> = (
  props: SendTransactionProps
) => {
  const Seperator = () => (
    <Flex mt={6} position="relative" width="100%" justifyContent="center">
      <Box
        position="absolute"
        width="300px"
        height="1px"
        left="-10px"
        background="#EEEEEE"
      />
      <Flex
        position="absolute"
        bottom="-12px"
        height="25px"
        width="80px"
        justifyContent="center"
        alignItems="center"
        borderRadius="50px"
        background="#EAF3FF"
      >
        <Text variant="body" color={theme.colors.brand.primary}>
          Send {abbrMap[walletApp.network as 'bitcoin' | 'ethereum']}
        </Text>
      </Flex>
    </Flex>
  );

  return (
    <Box width="100%" hidden={props.hidden}>
      <Seperator />
      <TransactionPane
        setHideWalletHero={props.setHideWalletHero}
        close={props.close}
        max={4}
      />
    </Box>
  );
};

export const EthDetail: FC<EthDetailProps> = observer(
  (props: EthDetailProps) => {
    const { walletApp } = useTrayApps();
    const { theme } = useServices();
    const [QROpen, setQROpen] = useState(false);
    const [sendTrans, setSendTrans] = useState(true);
    const [hideWalletHero, setHideWalletHero] = useState(false);

    const wallet = walletApp.ethereum.wallets.get(walletApp.currentAddress!);

    /* @ts-ignore */
    const theme =
      themes[theme.currentTheme.mode === 'light' ? 'light' : 'dark'];
    const panelBackground = darken(0.04, props.theme!.windowColor);
    const panelBorder = darken(0.08, props.theme!.windowColor);

    return (
      <Flex width="100%" height="100%" flexDirection="column" p={3}>
        {/* @ts-ignore */}
        <Flex
          p={3}
          width="100%"
          flexDirection="column"
          background={lighten(0.02, theme.currentTheme.windowColor)}
          boxShadow="0px 0px 9px rgba(0, 0, 0, 0.12)"
          borderRadius="16px"
        >
          <WalletInfo hideWalletHero={hideWalletHero} />
          <SendReceiveButtons />
          <SendTransaction
            hidden={!sendTrans}
            setHideWalletHero={setHideWalletHero}
            close={() => {
              setSendTrans(false);
              setHideWalletHero(false);
            }}
          />
        </Flex>
        <Box width="100%" hidden={QROpen || sendTrans}>
          <Flex
            width="100%"
            pt={6}
            flexDirection="column"
            justifyContent="center"
          >
            <Box pb={1}>
              <Text variant="body" fontSize={2} color="text.tertiary">
                Transactions
              </Text>
            </Box>
            {transactions.map((transaction, index) => (
              <Transaction key={index} transaction={transaction} />
            ))}
          </Flex>
        </Box>
      </Flex>
    );
  }
);
