import { ChangeEventHandler, useRef, useState } from 'react';

import { Box, Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';
import { ERC20Type, EthStoreType } from 'renderer/stores/models/wallet.model';

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
  ethereum: EthStoreType;
  setValid: (valid: boolean, amount?: number) => void;
};

export const AmountInput = ({
  max,
  coin,
  protocol,
  network,
  ethereum,
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
    if (ethereum.conversions.usd && !inCrypto) {
      amountInCrypto = usdToEth(numVal, ethereum.conversions.usd);
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
      <FlexHider width="100%" justifyContent="space-between">
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
              <TextInput
                id="amount-input"
                name="amount-input"
                ref={amountRef}
                style={{ width: '80%' }}
                autoFocus
                type="number"
                placeholder="0.0000000000000000000000"
                value={(amount ?? '').toString()}
                onChange={onChange}
              />
            ) : (
              <Flex>
                <Text.Custom pt="2px" fontSize="12px">
                  $
                </Text.Custom>
                <TextInput
                  id="amount-input"
                  name="amount-input"
                  autoFocus
                  ref={amountRef}
                  style={{ width: '80%' }}
                  type="number"
                  placeholder="0.00"
                  value={(amount ?? '').toString()}
                  onChange={onChange}
                />
              </Flex>
            )}
            {showUsd && (
              <Box hidden={!amount}>
                <Text.Custom fontSize="11px">
                  {ethereum.conversions.usd &&
                    (inCrypto
                      ? `$${ethToUsd(
                          Number(amount),
                          ethereum.conversions.usd
                        )} USD`
                      : `${usdToEth(
                          Number(amount),
                          ethereum.conversions.usd
                        )} ${
                          coin
                            ? coin.name
                            : abbrMap[network as 'bitcoin' | 'ethereum']
                        }`)}
                </Text.Custom>
              </Box>
            )}
          </Flex>
          <Flex
            justifyContent="center"
            alignItems="center"
            borderRadius="5px"
            onClick={toggleInCrypto}
          >
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
        </ContainerFlex>
      </FlexHider>
      <Box ml="72px" width="100%">
        <Text.Custom fontSize="11px" color="intent-caution">
          {amountError && 'Amount greater than wallet balance.'}
        </Text.Custom>
      </Box>
    </Flex>
  );
};
