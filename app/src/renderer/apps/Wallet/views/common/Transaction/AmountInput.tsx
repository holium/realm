import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { darken, lighten } from 'polished';

import { Flex, Box, Icons, Text } from 'renderer/components';
import { getBaseTheme } from '../../../lib/helpers';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { Input, ContainerFlex, FlexHider } from './styled';
import { ERC20Type } from 'os/services/tray/wallet.model';

// TODO: replace with actual exchange rate
let ethToUsd = (eth: number) => (isNaN(eth) ? 0 : (eth * 1715.66).toFixed(2));
let usdToEth = (usd: number) => (isNaN(usd) ? 0 : (usd / 1715.66).toFixed(12));

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
    const amountRef = React.createRef();
    const { theme } = useServices();
    const { walletApp } = useTrayApps();

    const [inCrypto, setInCrypto] = useState(true);
    const [amount, setAmount] = useState<string | number>(0);
    const [amountError, setAmountError] = useState(false);

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBackground = darken(0.04, theme.currentTheme!.windowColor);

    const check = (inCrypto: boolean, value: string | number) => {
      let numVal = Number(value);
      let amountInCrypto = inCrypto ? value : usdToEth(numVal);
      if (amountInCrypto > props.max) {
        setAmountError(true);
        return props.setValid(false);
      } else if (amountInCrypto === 0) {
        return props.setValid(false);
      } else {
        setAmountError(false);
        return props.setValid(true, numVal);
      }
    };

    const onChange = (e: any) => {
      let value: string = e.target.value;
      let isDecimal = value.includes('.');
      let decimalPlaces = isDecimal && value.split('.')[1].length;
      let isZero = Number(value) === 0;

      if (value.length > 10) return;
      if (!inCrypto && isDecimal && decimalPlaces > 2) return;

      check(inCrypto, Number(value));
      setAmount(isZero && isDecimal ? value : Number(value));
    };

    const toggleInCrypto = () => {
      let toggled = !inCrypto;

      setInCrypto(toggled);
      check(toggled, amount);

      if (toggled === false) {
        setAmount(Number(amount).toFixed(2));
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
                        props.coin
                          ? props.coin.name
                          : abbrMap[walletApp.network as 'bitcoin' | 'ethereum']
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
                  ? props.coin
                    ? props.coin.name
                    : abbrMap[walletApp.network as 'bitcoin' | 'ethereum']
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
