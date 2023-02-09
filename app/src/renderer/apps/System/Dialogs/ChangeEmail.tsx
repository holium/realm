import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import emailValidator from 'email-validator';

import {
  Flex,
  Input,
  TextButton,
  Spinner,
  Text,
  Label,
  BigInput,
  Button,
  Box,
} from 'renderer/components';
import { ThemeType } from 'renderer/theme';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { AuthActions } from 'renderer/logic/actions/auth';

export const ChangeEmailDialogConfig: DialogConfig = {
  component: (props: any) => <ChangeEmailDialog {...props} />,
  onClose: () => {
    ShellActions.closeDialog();
    ShellActions.setBlur(false);
  },
  windowProps: {
    appId: 'change-email-dialog',
    title: 'Change Email Dialog',
    zIndex: 13,
    type: 'dialog',
    bounds: {
      x: 0,
      y: 0,
      width: 450,
      height: 420,
    },
  },
  hasCloseButton: false,
  unblurOnClose: true,
  noTitlebar: false,
};

const ChangeEmailDialogPresenter = () => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const [view, setView] = useState('initial');

  const transitionToVerify = () => {
    setView('verify');
  };

  const emailVerified = () => {
    setView('success');
    setTimeout(() => {
      ShellActions.closeDialog();
      ShellActions.setBlur(false);
    }, 2000);
  };

  const screens = {
    initial: <InitialScreen done={transitionToVerify} baseTheme={baseTheme} />,
    verify: (
      <VerifyScreen done={emailVerified} theme={baseTheme as ThemeType} />
    ),
    success: <SuccessScreen baseTheme={baseTheme} />,
  };

  const Screen = screens[view as 'initial' | 'verify' | 'success'];

  return (
    <Flex px={16} pt={12} width="100%" height="100%" flexDirection="column">
      {Screen}
    </Flex>
  );
};

const ChangeEmailDialog = observer(ChangeEmailDialogPresenter);

function InitialScreen(props: { done: any; baseTheme: ThemeType }) {
  const { identity } = useServices();
  const [email, setEmail] = useState(identity.auth.email!);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event: any) => {
    setError('');
    console.log(`val: ${event.target.value}`);
    setEmail(event.target.value);
  };

  const onClick = async () => {
    console.log(`setting email: ${email}`);
    setLoading(true);
    const result = await AuthActions.changeEmail(email);
    setLoading(false);

    if (result.verificationCode) {
      props.done();
    } else {
      setError(result.error || 'Something went wrong, please try again.');
    }
  };

  return (
    <>
      <Flex flexDirection="column">
        <Text fontSize={3} fontWeight={500} mb={20}>
          Change Email
        </Text>
        <Text fontSize={2} lineHeight="copy" variant="body">
          Which email would you like to use for your account?
        </Text>
      </Flex>
      <Flex mt={8} flexDirection="column">
        <Label mb={3} required={true}>
          Email
        </Label>
        <Input onChange={onChange} type="email" required={true} />
        <Box mt={7} width="100%">
          <Button
            width="100%"
            disabled={
              !email ||
              !emailValidator.validate(email) ||
              email.toLowerCase() === identity.auth.email!.toLowerCase()
            }
            isLoading={loading}
            onClick={onClick}
          >
            Submit
          </Button>
        </Box>
        <Text
          variant="body"
          color={props.baseTheme.colors.text.error}
          fontSize={1}
        >
          {error}
        </Text>
      </Flex>
    </>
  );
}

const validChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function VerifyScreen(props: { theme: ThemeType; done: any }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const submit = async (code: string) => {
    const wasCorrect = await AuthActions.verifyNewEmail(code);
    wasCorrect ? props.done() : setError(true);
  };

  const onChange = async (value: string) => {
    setError(false);
    const newCode = value
      .trim()
      .split('')
      .filter((char) => validChars.includes(char))
      .slice(0, 6)
      .join('')
      .toUpperCase();

    setCode(newCode);
    if (newCode.length >= 6) submit(newCode);
  };

  return (
    <>
      <Flex mt={7} mb={5} flexDirection="column">
        <Text fontSize={3} fontWeight={500} mb={20}>
          Verify Email
        </Text>
        <Text fontSize={2} lineHeight="copy" variant="body">
          We sent a verification code to your email. Once you receive the code,
          confirm it below.
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Flex mt={5} width="100%" justifyContent="center">
          <BigInput
            mt={7}
            placeholder="A1F9C5"
            value={code}
            onChange={onChange}
          />
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

function ResendCodeButton(props: { theme: ThemeType }) {
  const [state, setState] = useState('initial');

  const resendCode = async () => {
    setState('loading');
    await AuthActions.resendNewEmailVerificationCode();
    setState('resent');
  };

  useEffect(() => {
    if (state === 'resent') setTimeout(() => setState('initial'), 3000);
  }, [state]);

  return (
    <Flex
      width="100%"
      justifyContent="center"
      flexDirection="row"
      alignItems="center"
    >
      {state === 'initial' || state === 'loading' ? (
        <>
          <TextButton
            fontSize={1}
            fontWeight={400}
            disabled={state === 'loading'}
            textColor={
              state === 'loading'
                ? props.theme.colors.text.disabled
                : props.theme.colors.brand.secondary
            }
            onClick={resendCode}
          >
            send another code
          </TextButton>
          {state === 'loading' && (
            <Spinner
              ml={1}
              size="8px"
              color={props.theme.colors.brand.secondary}
            />
          )}
        </>
      ) : (
        <Text
          variant="body"
          fontSize={1}
          color={props.theme.colors.text.success}
        >
          Another verification code was sent.
        </Text>
      )}
    </Flex>
  );
}

function SuccessScreen(props: { baseTheme: ThemeType }) {
  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Text color={props.baseTheme.colors.text.success}>
        Email successfully updated.
      </Text>
    </Flex>
  );
}
