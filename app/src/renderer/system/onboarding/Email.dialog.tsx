import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import emailValidator from 'email-validator';

import { Flex, Input, Label, Text, TextButton, Button, Box, BigInput, Spinner } from 'renderer/components';
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
      <Flex flexDirection="column">
         <Text fontSize={3} fontWeight={500} mb={20}>
          Email
        </Text>
        <Text fontSize={2} lineHeight="copy" variant="body">
          We need a contact email for account recovery purposes. We pledge a solemn oath to never
          share it with anyone or abuse it for marketing spam.
        </Text>
      </Flex>
      <Flex mt={8} flexDirection="column">
        <Label mb={3} required={true}>Email</Label>
        <Input value={email} onChange={onChange} type="email" required={true} />
        <Box mt={7} width="100%">
          <Button width="100%" disabled={!email || !emailValidator.validate(email)} isLoading={loading} onClick={onClick}>
            Submit
          </Button>
        </Box>
      </Flex>
    </>
  );
}

function VerifyScreen (props: { theme: ThemeType, verificationCode: string, done: any }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const submit = async (code: string) => {
    let wasCorrect = await OnboardingActions.verifyEmail(code);
    wasCorrect ? props.done() : setError(true);
  };

  const onChange = async (value: string) => {
    setError(false);
    let newCode = value
      .trim().split('').filter(char => validChars.includes(char))
      .slice(0, 6).join('').toUpperCase();

    setCode(newCode);
    if (newCode.length >= 6) submit(newCode);
  }

  return (
    <>
      <Flex mt={7} mb={5} flexDirection="column">
         <Text fontSize={3} fontWeight={500} mb={20}>
          Verify Email
        </Text>
        <Text fontSize={2} lineHeight="copy" variant="body">
          We sent a verification code to your email. Once you receive the code, verify it below.
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Flex mt={5} width="100%" justifyContent="center">
          <BigInput mt={7} placeholder="A1F9C5" value={code} onChange={onChange} />
        </Flex>
        <Flex mt={4} flexDirection="column">
          <ResendCodeButton theme={props.theme} />
          <Text mt={3} fontSize={1} color={props.theme.colors.text.error}>
            {error && 'Verification code was incorrect.'}
          </Text>
        </Flex>
      </Flex>
    </>
  );
}

function ResendCodeButton (props: { theme: ThemeType }) {
  const [ state, setState ] = useState('initial');

  const resendCode = async () => {
    setState('loading');
    await OnboardingActions.resendEmailConfirmation();
    setState('resent');
  }

  useEffect(() => {
    if (state === 'resent')
      setTimeout(() => setState('initial'), 3000);
  }, [state]);

  return (
    <Flex width="100%" justifyContent="center" flexDirection="row" alignItems="center">
      { state === 'initial' || state === 'loading'
        ? (
          <>
            <TextButton fontSize={1} fontWeight={400} disabled={state === 'loading'} textColor={state === 'loading' ? props.theme.colors.text.disabled : props.theme.colors.brand.secondary} onClick={resendCode}>
              send another code
            </TextButton>
            { state === 'loading' && <Spinner ml={1} size="8px" color={props.theme.colors.brand.secondary} /> }
          </>
        )
        : (
          <Text variant="body" fontSize={1} color={props.theme.colors.text.success}>
            Another verification code was sent.
          </Text>
        )
      }
    </Flex>
  );
}
