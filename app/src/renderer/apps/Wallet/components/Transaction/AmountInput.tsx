import { useRef, useState } from 'react';
import { observer } from 'mobx-react';

import { Box, Flex, Icon, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';
import { ERC20Type } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { ethToUsd, usdToEth } from '../../helpers';
import { ContainerFlex, FlexHider } from './AmountInput.styles';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

type Props = {
  max: number;
  coin?: ERC20Type | null;
  setValid: (valid: boolean, amount?: number) => void;
};

export const AmountInputPresenter = ({ max, coin, setValid }: Props) => {
  const amountRef = useRef<HTMLInputElement>(null);
  const { walletStore } = useShipStore();

  const [inCryptoToggle, setInCryptoToggle] = useState(true);
  const showUsd =
    walletStore.navState.protocol === ProtocolType.ETH_MAIN ||
    (walletStore.navState.protocol === ProtocolType.ETH_GORLI && !coin);

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

  const onChange = (e: any) => {
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
                placeholder="0.00000000"
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
                          coin
                            ? coin.name
                            : walletStore.navState.protocol ===
                              ProtocolType.UQBAR
                            ? 'zigs'
                            : abbrMap[
                                walletStore.navState.network as
                                  | 'bitcoin'
                                  | 'ethereum'
                              ]
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
                  : walletStore.navState.protocol === ProtocolType.UQBAR
                  ? 'zigs'
                  : abbrMap[
                      walletStore.navState.network as 'bitcoin' | 'ethereum'
                    ]
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

export const AmountInput = observer(AmountInputPresenter);
