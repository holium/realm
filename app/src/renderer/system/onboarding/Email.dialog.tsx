import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import emailValidator from 'email-validator';

import { Flex, Input, Label, Text, Button, BigInput } from 'renderer/components';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { ThemeType } from 'renderer/theme';

export const EmailDialog: FC<BaseDialogProps> = observer((props: BaseDialogProps) => {
  const { onboarding, desktop } = useServices();
  const theme = getBaseTheme(desktop);
  const [view, setView] = useState('initial');
  const done = () => props.onNext && props.onNext();

  return (
    <Flex px={16} pt={12} width="100%" height="100%" flexDirection="column">
      {view === 'initial'
        ? <InitialScreen done={() => setView('verify')} />
        : <VerifyScreen verificationCode={onboarding.verificationCode!} done={done} theme={theme as ThemeType} />
      }
    </Flex>
  );
})

export default EmailDialog;

function InitialScreen (props: { done: any }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const onChange = (event: any) => setEmail(event.target.value);

  const onClick = async () => {
    setLoading(true);
    await OnboardingActions.setEmail(email);
    setLoading(false);
    props.done();
  }

  return (
    <>
      <Flex mt={7} flexDirection="column">
         <Text fontSize={3} fontWeight={500} mb={20}>
          Email
        </Text>
        <Text fontSize={2} lineHeight="copy" variant="body">
          We need a contact email for account recovery purposes. We pledge a solemn oath to never
          share it with anyone or abuse it for marketing spam.
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Label required={true}>Email</Label>
        <Input value={email} onChange={onChange} type="email" required={true} />
        <Button mt="50px" disabled={!email || !emailValidator.validate(email)} isLoading={loading} onClick={onClick}>
          Submit
        </Button>
      </Flex>
    </>
  );
}

function VerifyScreen (props: { theme: ThemeType, verificationCode: string, done: any }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const onChange = (value: string) => {
    setError(false);
    setCode(value
      .split('').filter(char => validChars.includes(char))
      .join('').toUpperCase());
  }

  const submit = async () => {
    let wasCorrect = await OnboardingActions.verifyEmail(code);
    wasCorrect
      ? props.done()
      : setError(true);
  };

  return (
    <>
      <Flex mt={7} flexDirection="column">
         <Text fontSize={3} fontWeight={500} mb={20}>
          Verify Email
        </Text>
        <Text fontSize={2} lineHeight="copy" variant="body">
          We sent a verification code to your email. Once you receive the code, verify it below.
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Label required={true}>Verification Code</Label>
        <BigInput mt={3} placeholder="A1F9C5" value={code} onChange={onChange} />
        <Button mt={5} disabled={code.length < 6} onClick={submit}>Submit</Button>
        <Text mt={3} fontSize={1} color={props.theme.colors.text.error}>
          {error && 'Verification code was incorrect.'}
        </Text>
      </Flex>
    </>
  );
}
