import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Box, Icon, Text, Input } from '@holium/design-system';
import { ContainerFlex, FlexHider } from './styled';
import {
  ERC20Type,
  ProtocolType,
} from 'os/services/tray/wallet-lib/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

// TODO: replace with actual exchange rate
const ethToUsd = (eth: number, currentPrice: number) =>
  isNaN(eth) ? 0 : (eth * currentPrice).toFixed(2);
const usdToEth = (usd: number, currentPrice: number) =>
  isNaN(usd) ? 0 : Number((usd / currentPrice).toFixed(8));

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export const AmountInput = observer(
  (props: {
    max: number;
    setValid: (valid: boolean, amount?: number) => void;
    coin?: ERC20Type | null;
  }) => {
    const amountRef = React.createRef<HTMLInputElement>();
    const { walletStore } = useShipStore();

    const [inCryptoToggle, setInCryptoToggle] = useState(true);
    const showUsd =
      walletStore.navState.protocol === ProtocolType.ETH_MAIN ||
      (walletStore.navState.protocol === ProtocolType.ETH_GORLI && !props.coin);

    const inCrypto = showUsd ? inCryptoToggle : true;

    const [amount, setAmount] = useState<string | number>(0);
    const [amountError, setAmountError] = useState(false);

    const check = (inCrypto: boolean, value: string | number) => {
      const numVal = Number(value);
      let amountInCrypto = numVal;
      if (walletStore.ethereum.conversions.usd && !inCrypto) {
        amountInCrypto = usdToEth(numVal, walletStore.ethereum.conversions.usd);
        // inCrypto ? numVal : usdToEth(numVal, currentPrice);
      }
      if (amountInCrypto > props.max) {
        setAmountError(true);
        return props.setValid(false);
      } else if (amountInCrypto === 0) {
        return props.setValid(false);
      } else {
        setAmountError(false);
        return props.setValid(true, amountInCrypto);
      }
    };

    const onChange = (e: any) => {
      const value: string = e.target.value;
      const isDecimal = value.includes('.');
      const decimalPlaces = isDecimal && value.split('.')[1].length;
      const isZero = Number(value) === 0;

      if (value.length > 10) return;
      if (!inCrypto && isDecimal && decimalPlaces > 2) return;

      check(inCrypto, Number(value));
      setAmount(isZero && isDecimal ? value : Number(value));
    };

    const toggleInCrypto = () => {
      if (showUsd) {
        const toggled = !inCrypto;

        setInCryptoToggle(toggled);
        check(toggled, amount);

        if (!toggled) {
          setAmount(0);
        }
      }
    };

    const inputContainerClicked = () => {
      amountRef.current && (amountRef.current as HTMLElement).focus();
    };

    return (
      <Flex flexDirection="column">
        <FlexHider
          width="100%"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <Text.Body fontSize={1} variant="body">
            AMOUNT
          </Text.Body>
          <ContainerFlex
            className="realm-cursor-hover"
            px={1}
            py={1}
            onClick={inputContainerClicked}
            width="200px"
            height="40px"
            justifyContent="space-between"
            borderRadius="7px"
          >
            <Flex
              px={1}
              flexDirection="column"
              justifyContent="center"
              alignItems="flex-start"
            >
              {inCrypto ? (
                <Input
                  ref={amountRef}
                  style={{ width: '80%' }}
                  autoFocus
                  type="number"
                  placeholder="0.00000000"
                  value={amount || ''}
                  onChange={onChange}
                />
              ) : (
                <Flex>
                  <Text.Body pt="2px" fontSize="12px">
                    $
                  </Text.Body>
                  <Input
                    autoFocus
                    ref={amountRef}
                    style={{ width: '80%' }}
                    type="number"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={onChange}
                  />
                </Flex>
              )}
              {showUsd && (
                <Box hidden={!amount}>
                  <Text.Body fontSize="11px">
                    {walletStore.ethereum.conversions.usd &&
                      (inCrypto
                        ? `$${ethToUsd(
                            Number(amount),
                            walletStore.ethereum.conversions.usd
                          )} USD`
                        : `${usdToEth(
                            Number(amount),
                            walletStore.ethereum.conversions.usd
                          )} ${
                            props.coin
                              ? props.coin.name
                              : walletStore.navState.protocol ===
                                ProtocolType.UQBAR
                              ? 'zigs'
                              : abbrMap[
                                  walletStore.navState.network as
                                    | 'bitcoin'
                                    | 'ethereum'
                                ]
                          }`)}
                  </Text.Body>
                </Box>
              )}
            </Flex>
            <Flex
              p="4px"
              justifyContent="center"
              alignItems="center"
              borderRadius="5px"
              onClick={toggleInCrypto}
            >
              <Text.Body fontSize="12px">
                {inCrypto
                  ? props.coin
                    ? props.coin.name
                    : walletStore.navState.protocol === ProtocolType.UQBAR
                    ? 'zigs'
                    : abbrMap[
                        walletStore.navState.network as 'bitcoin' | 'ethereum'
                      ]
                  : 'USD'}
              </Text.Body>
              {showUsd && <Icon ml={1} name="UpDown" size="12px" />}
            </Flex>
          </ContainerFlex>
        </FlexHider>
        <Box mt={2} ml="72px" width="100%">
          <Text.Body
            variant="body"
            fontSize="11px"
            color={themeData.colors.text.error}
          >
            {amountError && 'Amount greater than wallet balance.'}
          </Text.Body>
        </Box>
      </Flex>
    );
  }
);
