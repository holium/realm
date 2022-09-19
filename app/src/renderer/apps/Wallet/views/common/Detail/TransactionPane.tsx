import React, { FC, useEffect, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import { errors, ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { theme as themes } from 'renderer/theme';
import { darken, lighten } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import {
  Flex,
  Box,
  Icons,
  Text,
  Sigil,
  Button,
  ImagePreview,
} from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import {
  shortened,
  formatWei,
  convertWeiToUsd,
  monthNames,
  getBaseTheme,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  BitcoinWalletType,
  EthWalletType,
  WalletStoreType,
} from 'os/services/tray/wallet.model';
import { RecipientPayload } from 'os/services/tray/wallet.service';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

let ethToUsd = (eth: number) => (isNaN(eth) ? 0 : (eth * 1715.66).toFixed(2));
let usdToEth = (usd: number) => (isNaN(usd) ? 0 : (usd / 1715.66).toFixed(12));

interface ContainerFlexProps {
  focusBorder: string;
}
/* @ts-ignore */
const ContainerFlex = styled(Flex)<ContainerFlexProps>`
  :focus-within {
    /* @ts-ignore */
    border: 1px solid ${(props) => props.focusBorder};
  }
`;

interface InputProps {
  mode: 'light' | 'dark';
}
const Input = styled.input<InputProps>`
  -webkit-appearance: none;
  width: ${(props) => (props.width ? props.width : '100px;')};
  background-color: inherit;
  border: 0;
  color: ${(props) =>
    props.mode === 'light' ? '#333333' : '#ffffff'} !important;
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

const AmountInput = observer(
  (props: {
    max: number;
    setValid: (valid: boolean, amount?: number) => void;
  }) => {
    const amountRef = React.createRef();
    const { theme } = useServices();
    const { walletApp } = useTrayApps();

    const [inCrypto, setInCrypto] = useState(true);
    const [amount, setAmount] = useState(0);
    const [amountError, setAmountError] = useState(false);

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBackground = darken(0.04, theme.currentTheme!.windowColor);
    const panelBorder = darken(0.08, theme.currentTheme!.windowColor);

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

    const inputContainerClicked = () => {
      (amountRef.current! as HTMLElement).focus();
    };

    return (
      <Flex flexDirection="column">
        <FlexHider
          width="100%"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <Text
            fontSize={1}
            variant="body"
            color={themeData.colors.text.secondary}
          >
            AMOUNT
          </Text>
          {/* @ts-ignore */}
          <ContainerFlex
            focusBorder={themeData.colors.brand.primary}
            px={1}
            py={1}
            onClick={inputContainerClicked}
            width="200px"
            height="40px"
            justifyContent="space-between"
            borderRadius="7px"
            background={panelBackground}
            border={`solid 1px ${
              amountError
                ? themeData.colors.text.error
                : themeData.colors.ui.borderColor
            }`}
          >
            <Flex
              pl="10px"
              flexDirection="column"
              justifyContent="center"
              alignItems="flex-start"
            >
              {inCrypto ? (
                /* @ts-ignore */
                <Input
                  autoFocus
                  ref={amountRef}
                  mode={theme.currentTheme.mode}
                  type="number"
                  color={themeData.colors.text.primary}
                  placeholder="0.00000000"
                  value={amount || ''}
                  onChange={onChange}
                />
              ) : (
                <Flex>
                  <Text pt="2px" fontSize="12px">
                    $
                  </Text>
                  {/* @ts-ignore */}
                  <Input
                    autoFocus
                    ref={amountRef}
                    mode={theme.currentTheme.mode}
                    type="number"
                    color={themeData.colors.text.primary}
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={onChange}
                  />
                </Flex>
              )}
              <Box hidden={!amount}>
                <Text fontSize="11px" color={themeData.colors.text.disabled}>
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
              border={`solid 1px ${themeData.colors.ui.borderColor}`}
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
          </ContainerFlex>
        </FlexHider>
        <Box mt={2} ml="72px" width="100%">
          <Text
            variant="body"
            fontSize="11px"
            color={themeData.colors.text.error}
          >
            {amountError && 'Amount greater than wallet balance.'}
          </Text>
        </Box>
      </Flex>
    );
  }
);

const RecipientInput = observer(
  (props: {
    setGasEstimate: any;
    setValid: (
      valid: boolean,
      recipient: { address?: string; patp?: string; patpAddress?: string }
    ) => void;
  }) => {
    const { theme } = useServices();
    const { walletApp } = useTrayApps();

    const [icon, setIcon] = useState('blank');
    const [valueCache, setValueCache] = useState('');
    const [recipient, setRecipient] = useState('');
    const [recipientError, setRecipientError] = useState('');

    // const [detailsLoading, setDetailsLoading] = useState(false);
    const [recipientDetails, setRecipientDetails] = useState<{
      failed: boolean;
      details: RecipientPayload | null;
    }>({ failed: false, details: null });
    const [currPromise, setCurrPromise] =
      useState<Promise<RecipientPayload | null> | null>(null);

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBackground = darken(0.04, theme.currentTheme!.windowColor);
    const panelBorder = darken(0.08, theme.currentTheme!.windowColor);

    const getRecipient = async (patp: string) => {
      console.log(`trying to get recipient ${patp}`);
      let promise = WalletActions.getRecipient(patp);
      setCurrPromise(promise);

      promise
        .then((details: RecipientPayload | null) => {
          console.log(`money! it resolved`);
          console.log(details);
          if (currPromise && currPromise !== promise) return;

          details && details.address
            ? setRecipientDetails({ failed: false, details })
            : setRecipientDetails({ failed: true, details: null });

          if (details && details.gasEstimate) {
            props.setGasEstimate(details.gasEstimate);
          }

          setCurrPromise(null);
        })
        .catch((err: Error) => {
          console.error(err);
          if (currPromise && currPromise !== promise) return;
          setRecipientDetails({ failed: true, details: null });
          setCurrPromise(null);
        });
    };

    useEffect(() => {
      console.log('effecting...');
      console.log(recipientDetails.details);
      console.log(recipient);
      if (
        !recipientDetails.failed &&
        recipientDetails.details?.patp === recipient
      ) {
        console.log('she valid');
        props.setValid(true, {
          patp: recipientDetails.details.patp,
          patpAddress: recipientDetails!.details.address!,
        });
      } else if (
        recipientDetails.failed &&
        recipientDetails.details?.patp === recipient
      ) {
        console.log('no dice');
        props.setValid(false, {});
      }
    }, [recipientDetails]);

    const onChange = (e: any) => {
      let value: string = e.target.value;
      let validAddress =
        walletApp.network === 'ethereum'
          ? ethers.utils.isAddress(value)
          : false; // TODO add bitcoin validation
      let validPatp = isValidPatp(value);

      if (validAddress) {
        setIcon('spy');
        setValueCache(value);

        props.setValid(true, { address: value });
        return setRecipient(shortened(value));
      } else if (validPatp) {
        setIcon('sigil');
        setValueCache(value);

        getRecipient(value);
        // props.setValid(true, { patp: value });
      } else if (isValidPatp(`~${value}`)) {
        setIcon('sigil');
        setValueCache(`~${value}`);

        getRecipient(value);
        // props.setValid(true, { patp: value });
        return setRecipient(`~${value}`);
      } else {
        setIcon('blank');
        setValueCache('');
        props.setValid(false, {});
      }

      setRecipient(value);
    };

    const RecipientIcon = (props: { icon: string }) => {
      if (recipientDetails.details?.recipientMetadata) {
        let metadata = recipientDetails.details.recipientMetadata;
        if (metadata.avatar) {
          return (
            <ImagePreview src={metadata.avatar} height="24px" width="24px" />
          );
        } else if (metadata.color) {
          return (
            <Sigil
              color={[metadata.color, 'white']}
              simple={true}
              size={24}
              patp={valueCache!}
            />
          );
        }
      }

      if (props.icon === 'spy')
        return (
          <Icons
            name="Spy"
            size="24px"
            color={themeData.colors.text.secondary}
          />
        );

      if (props.icon === 'sigil')
        return (
          <Sigil
            color={
              theme.currentTheme.mode === 'light'
                ? ['black', 'white']
                : ['white', 'black']
            }
            simple={true}
            size={24}
            patp={valueCache!}
          />
        );

      let blankBg =
        theme.currentTheme.mode === 'light'
          ? lighten(0.1, themeData.colors.text.disabled)
          : darken(0.04, themeData.colors.text.disabled);
      return (
        <Box
          background={blankBg}
          height="24px"
          width="24px"
          borderRadius="5px"
        />
      );
    };

    return (
      <Flex flexDirection="column">
        <Flex width="100%" justifyContent="space-evenly" alignItems="center">
          <Text
            fontSize={1}
            variant="body"
            color={themeData.colors.text.secondary}
          >
            TO
          </Text>
          {/* @ts-ignore */}
          <ContainerFlex
            focusBorder={themeData.colors.brand.primary}
            px={1}
            py={1}
            width="240px"
            height="45px"
            borderRadius="7px"
            alignItems="center"
            background={panelBackground}
            border={`solid 1px ${
              recipientError
                ? themeData.colors.text.error
                : themeData.colors.ui.borderColor
            }`}
          >
            <Flex ml={1} mr={2}>
              <RecipientIcon icon={icon} />
            </Flex>
            <Input
              mode={theme.currentTheme.mode === 'light' ? 'light' : 'dark'}
              width="100%"
              placeholder="@p or recipient’s address"
              spellCheck="false"
              value={recipient}
              onChange={onChange}
            />
          </ContainerFlex>
        </Flex>
        <Box mt={2} ml="72px" width="100%">
          <Text
            variant="body"
            fontSize="11px"
            color={themeData.colors.text.error}
          >
            {recipientDetails.failed &&
              recipientDetails.details?.patp === recipient &&
              `${recipient} doesn\'nt have wallet installed yet.`}
          </Text>
        </Box>
      </Flex>
    );
  }
);

interface TransactionPaneProps {
  max: number;
  onScreenChange: any;
  close: any;
}

export const TransactionPane: FC<TransactionPaneProps> = observer(
  (props: TransactionPaneProps) => {
    const { walletApp } = useTrayApps();
    const [screen, setScreen] = useState('initial');

    const [amountValid, setAmountValid] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState(0);

    const [recipientValid, setRecipientValid] = useState(false);
    const [transactionRecipient, setTransactionRecipient] = useState<{
      address?: string;
      patp?: string;
      patpAddress?: string;
    }>({});

    const [gasEstimate, setGasEstimate] = useState<number | null>(null);

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
      // send to wallet
      // WalletActions.sendEthereumTransaction(walletApp.currentAddress, )
      console.log('here we gooooooooooo');
      try {
        await WalletActions.sendEthereumTransaction(
          walletApp.currentIndex!,
          transactionRecipient.address || transactionRecipient.patpAddress!,
          transactionAmount.toString(),
          transactionRecipient.patp,
        );
        console.log('leo crushed it');
        setScreen('initial');
        props.close();
      } catch (e) {
        console.log('sending trans failed');
        console.log(e);
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
            <AmountInput max={props.max} setValid={amountValidator} />
            <Box width="100%" mt={4}>
              <RecipientInput
                setValid={recipientValidator}
                setGasEstimate={setGasEstimate}
              />
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
              {/* @ts-ignore */}
              {transactionAmount} {abbrMap[walletApp.network]}
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
                    {transactionRecipient.address ? (
                      <Icons
                        name="Spy"
                        size="24px"
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
                        size={24}
                        patp={transactionRecipient.patp!}
                      />
                    )}
                  </Flex>
                  <Flex flexDirection="column" justifyContent="center">
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
                  </Flex>
                </Flex>
              </Flex>
              <Flex mt={5} width="100%" justifyContent="space-between">
                <Text variant="body" color={themeData.colors.text.secondary}>
                  NETWORK FEE
                </Text>
                <Flex flexDirection="column">
                  <Text variant="body">0.0005 ETH</Text>
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
                  <Text variant="body">3.4505 ETH</Text>
                  <Text fontSize={1} color={themeData.colors.text.secondary}>
                    ≈ {ethToUsd(3.4505)} USD
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex mt={7} justifyContent="space-between">
              <Button variant="transparent" onClick={() => prev()}>
                Reject
              </Button>
              <Button px={2} onClick={sendTransaction}>
                Confirm
              </Button>
            </Flex>
          </Flex>
        )}
      </>
    );
  }
);
