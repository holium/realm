import { ChangeEventHandler, useRef, useState } from 'react';

import { Box, Button, Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';
import { ERC20Type } from 'renderer/stores/models/wallet.model';

import { ethToUsd, usdToEth } from '../../helpers';
import { ContainerFlex, FlexHider } from './AmountInput.styles';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

type Props = {
  max: number;
  coin?: ERC20Type | null;
  protocol: ProtocolType;
  network: NetworkType;
  ethPrice: number | undefined;
  setValid: (valid: boolean, amount?: number) => void;
};

export const AmountInput = ({
  max,
  coin,
  protocol,
  network,
  ethPrice,
  setValid,
}: Props) => {
  const amountRef = useRef<HTMLInputElement>(null);

  const [inCryptoToggle, setInCryptoToggle] = useState(true);
  const showUsd =
    protocol === ProtocolType.ETH_MAIN ||
    (protocol === ProtocolType.ETH_GORLI && !coin);

  const inCrypto = showUsd ? inCryptoToggle : true;

  const [amount, setAmount] = useState<string | number>(0);
  const [amountError, setAmountError] = useState(false);

  const check = (inCrypto: boolean, value: string | number) => {
    const numVal = Number(value);
    let amountInCrypto = numVal;
    if (ethPrice && !inCrypto) {
      amountInCrypto = usdToEth(numVal, ethPrice);
      // inCrypto ? numVal : usdToEth(numVal, currentPrice);
    }
    if (amountInCrypto > max) {
      setAmountError(true);
      return setValid(false);
    } else if (amountInCrypto === 0) {
      return setValid(false);
    } else {
      setAmountError(false);
      return setValid(true, amountInCrypto);
    }
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value: string = e.target.value;
    const isDecimal = value.includes('.');
    const decimalPlaces = isDecimal ? value.split('.')[1].length : 0;
    const isLong = decimalPlaces > 2;
    const isZero = Number(value) === 0;

    if (value.length > 10) return;
    if (!inCrypto && isDecimal && isLong) return;

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
        justifyContent="space-between"
        alignItems="center"
        gap="16px"
      >
        <Text.Body fontSize={1}>AMOUNT</Text.Body>
        <ContainerFlex onClick={inputContainerClicked}>
          <Flex flex={1} minWidth={0}>
            {inCrypto ? (
              <TextInput
                id="amount-input"
                name="amount-input"
                ref={amountRef}
                autoFocus
                type="number"
                placeholder="0.0000000000000000000000"
                value={(amount ?? '').toString()}
                onChange={onChange}
              />
            ) : (
              <Flex
                flex={1}
                minWidth={0}
                alignItems="center"
                gap="4px"
                pl="4px"
              >
                <Text.Body fontSize="12px">$</Text.Body>
                <TextInput
                  id="amount-input"
                  name="amount-input"
                  autoFocus
                  ref={amountRef}
                  type="number"
                  placeholder="0.00"
                  value={(amount ?? '').toString()}
                  onChange={onChange}
                />
              </Flex>
            )}
          </Flex>
          <Button.Transparent onClick={toggleInCrypto}>
            <Flex justifyContent="center" alignItems="center">
              <Text.Custom fontSize="12px">
                {inCrypto
                  ? coin
                    ? coin.name
                    : protocol === ProtocolType.UQBAR
                    ? 'zigs'
                    : abbrMap[network as 'bitcoin' | 'ethereum']
                  : 'USD'}
              </Text.Custom>
              {showUsd && <Icon ml={1} name="UpDown" size="12px" />}
            </Flex>
          </Button.Transparent>
        </ContainerFlex>
      </FlexHider>
      <Flex mt="4px" gap="2px" ml="72px" width="100%" flexDirection="column">
        {showUsd && (
          <Box hidden={!amount}>
            <Text.Custom fontSize="11px" opacity={0.7}>
              {ethPrice &&
                (inCrypto
                  ? `$${ethToUsd(Number(amount), ethPrice, 4)} USD`
                  : `${usdToEth(Number(amount), ethPrice)} ${
                      coin
                        ? coin.name
                        : abbrMap[network as 'bitcoin' | 'ethereum']
                    }`)}
            </Text.Custom>
          </Box>
        )}
        {amountError && (
          <Text.Custom fontSize="11px" color="intent-caution">
            Amount greater than wallet balance.
          </Text.Custom>
        )}
      </Flex>
    </Flex>
  );
};
