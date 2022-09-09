import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Box } from 'renderer/components';
import { darken, transparentize } from 'polished';
import { theme } from 'renderer/theme';
import { useServices } from 'renderer/logic/store';

interface PasscodeProps {
  seedPhrase: string
  onNext: React.MouseEventHandler<HTMLButtonElement>
  panelBackground: string
  panelBorder: string
  theme: any
}

export const Passcode: FC<PasscodeProps> = observer((props: PasscodeProps) => {
  let [passcode, setPasscode] = useState('');
  const { desktop } = useServices();
  console.log(props.seedPhrase);

  const panelBackground = darken(0.02, desktop.theme!.windowColor);
  const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;


  useEffect(() => {
    let listener = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        console.log('back del!')
        return passcode.length
          ? setPasscode(passcode.substring(0, passcode.length - 1))
          : null;
      }
      console.log('got key')

      if (passcode.length >= 6 || isNaN(Number(event.key)))
        return console.log('oops')

      console.log(passcode)
      console.log(event.key)
      console.log(passcode.concat(event.key))

      setPasscode(passcode.concat(event.key));
      //return setPasscode(passcode.concat(event.key));
    }

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, [])

  return (
    <Flex width="100%" height="100%" flexDirection="column" justifyContent="space-evenly" alignItems="center">
      <Flex flexDirection="column">
        <Text variant="h5">Set a passcode</Text>
        <Text mt={3} variant="body">
          Set a 6-digit passcode to unlock your wallet. This adds an extra layer of security but is not needed to recover your wallet.
        </Text>
      </Flex>
      <Flex alignItems="center">
        <PasscodeDisplay numDigits={passcode.length} border={panelBorder} background={panelBackground} />
      </Flex>
    </Flex>
  )
});

const PasscodeDisplay: FC<any> = (props: { numDigits: number, border: string, background: string }) => {
  let Filled = () => (
    <Flex mx="6px" height={35} width={32} border={`solid 1px ${theme.light.colors.brand.primary}`} alignItems="center" justifyContent="center">
      <Box height="8px" backgroundColor={theme.light.colors.text.primary} borderRadius="50%"></Box>
    </Flex>
  )

  let Empty = (props: any) => (
    <Flex mx="6px" height={35} width={32} border={props.border} background={props.background}>
    </Flex>
  )

  return (
    <Flex width="100%" alignItems="center" justifyContent="center">
      {[...Array(6).keys()].map(index => {
        return index < props.numDigits
          ? <Filled key={index} />
          : <Empty key={index} border={props.border} background={props.background} />
      })}
    </Flex>
  )
}
