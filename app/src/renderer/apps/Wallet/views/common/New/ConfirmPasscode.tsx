import { FC, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Box, Icons } from 'renderer/components';
import { darken, transparentize } from 'polished';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../../lib/helpers';
import { NewWalletScreen } from './index';

interface PasscodeProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
  correctPasscode: string;
}

export const ConfirmPasscode: FC<PasscodeProps> = observer(
  (props: PasscodeProps) => {
    let [passcode, setPasscode] = useState('');
    let [wrongCode, setWrongCode] = useState(false);
    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

    const panelBackground = darken(0.02, theme.currentTheme!.windowColor);
    const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;

    useEffect(() => {
      let listener = (event: KeyboardEvent) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
          return passcode.length
            ? setPasscode(passcode.substring(0, passcode.length - 1))
            : null;
        }

        if (passcode.length >= 6 || isNaN(Number(event.key))) return;

        let newPasscode = passcode.concat(event.key);
        if (newPasscode.length === 6) {
          props.setScreen(NewWalletScreen.CONFIRM_PASSCODE);
        }

        return setPasscode(newPasscode);
      };

      document.addEventListener('keydown', listener);

      return () => document.removeEventListener('keydown', listener);
    }, [passcode]);

    useEffect(() => {
      if (passcode === props.correctPasscode) {
        return props.setScreen(NewWalletScreen.FINALIZING);
      } else if (passcode.length === 6) {
        setWrongCode(true);
      } else {
        setWrongCode(false);
      }
    }, [passcode]);

    const PasscodeDisplay: FC<any> = (props: {
      numDigits: number;
      border: string;
      background: string;
    }) => {
      let Filled = () => (
        <Flex
          mx="6px"
          height={35}
          width={32}
          border={`solid 1px ${themeData.colors.brand.primary}`}
          alignItems="center"
          justifyContent="center"
        >
          <Box
            height="8px"
            width="8px"
            backgroundColor={themeData.colors.text.primary}
            borderRadius="50%"
          ></Box>
        </Flex>
      );

      let Empty = (props: any) => (
        <Flex
          mx="6px"
          height={35}
          width={32}
          border={props.border}
          background={props.background}
        ></Flex>
      );

      return (
        <Flex width="100%" alignItems="center" justifyContent="center">
          {[...Array(6).keys()].map((index) => {
            return index < props.numDigits ? (
              <Filled key={index} />
            ) : (
              <Empty
                key={index}
                border={props.border}
                background={props.background}
              />
            );
          })}
        </Flex>
      );
    };

    return (
      <>
      <Flex
        width="100%"
        height="100%"
        flexDirection="column"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Flex flexDirection="column">
          <Text variant="h5">Confirm passcode</Text>
          <Text mt={3} variant="body">
            Please retype your passcode to confirm.
          </Text>
        </Flex>
        <Flex alignItems="center">
          <PasscodeDisplay
            numDigits={passcode.length}
            border={panelBorder}
            background={panelBackground}
          />
        </Flex>
        <Flex alignItems="center">
          <Text variant="body" color={themeData.colors.text.error}>
            {wrongCode && 'Incorrect passcode.'}
          </Text>
        </Flex>
      </Flex>
      <Flex position="absolute" top="542px" zIndex={999} onClick={() => props.setScreen(NewWalletScreen.PASSCODE)}>
        <Icons name="ArrowLeftLine" size={2} color={theme.currentTheme.iconColor} />
      </Flex>
      </>
    );
  }
);
