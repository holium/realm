import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import emailValidator from 'email-validator';
import { Label, BigInput } from 'renderer/components';
import {
  TextInput,
  Text,
  Button,
  Box,
  Flex,
  Spinner,
} from '@holium/design-system';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { AuthActions } from 'renderer/logic/actions/auth';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { appState } from 'renderer/stores/app.store';

export const ChangeEmailDialogConfig: DialogConfig = {
  component: (props: any) => <ChangeEmailDialog {...props} />,
  onClose: () => {
    appState.shellStore.closeDialog();
    appState.shellStore.setIsBlurred(false);
  },
  getWindowProps: (desktopDimensions) => ({
    appId: 'change-email-dialog',
    title: 'Change Email Dialog',
    zIndex: 13,
    type: 'dialog',
    bounds: normalizeBounds(
      {
        x: 0,
        y: 0,
        width: 450,
        height: 420,
      },
      desktopDimensions
    ),
  }),
  hasCloseButton: true,
  unblurOnClose: true,
  noTitlebar: false,
};

const ChangeEmailDialogPresenter = () => {
  const [view, setView] = useState('initial');

  const transitionToVerify = () => {
    setView('verify');
  };

  const emailVerified = () => {
    setView('success');
    setTimeout(() => {
      appState.shellStore.closeDialog();
      appState.shellStore.setIsBlurred(false);
    }, 2000);
  };

  const screens = {
    initial: <InitialScreen done={transitionToVerify} />,
    verify: <VerifyScreen done={emailVerified} />,
    success: <SuccessScreen />,
  };

  const Screen = screens[view as 'initial' | 'verify' | 'success'];

  return (
    <Flex px={16} pt={12} width="100%" height="100%" flexDirection="column">
      {Screen}
    </Flex>
  );
};

const ChangeEmailDialog = observer(ChangeEmailDialogPresenter);

function InitialScreen(props: { done: any }) {
  // TODO: add email validation --------------------
  // const { identity } = useServices();
  const currentEmail = 'email@email.com';
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event: any) => {
    setError('');
    console.log(`val: ${event.target.value}`);
    setEmail(event.target.value);
  };

  const onClick = async () => {
    if (!email) return;
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
        <Text.Custom fontSize={3} fontWeight={500} mb={20}>
          Change Email
        </Text.Custom>
        <Text.Custom fontSize={2} lineHeight="copy" variant="body">
          Which email would you like to use for your account?
        </Text.Custom>
      </Flex>
      <Flex mt={8} flexDirection="column">
        <Label mb={3} required={true}>
          Email
        </Label>
        <TextInput
          id="email-change"
          name="email-change"
          type="email"
          required={true}
          onChange={onChange}
        />
        <Box mt={7} width="100%">
          <Button.Primary
            width="100%"
            disabled={
              !email ||
              !emailValidator.validate(email) ||
              email.toLowerCase() === currentEmail?.toLowerCase()
            }
            onClick={onClick}
          >
            {loading ? <Spinner color="white" size={0} /> : 'Submit'}
          </Button.Primary>
        </Box>
        <Text.Custom variant="body" fontSize={1}>
          {error}
        </Text.Custom>
      </Flex>
    </>
  );
}

const validChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function VerifyScreen(props: { done: any }) {
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
        <Text.Custom fontSize={3} fontWeight={500} mb={20}>
          Verify Email
        </Text.Custom>
        <Text.Custom fontSize={2} lineHeight="copy" variant="body">
          We sent a verification code to your email. Once you receive the code,
          confirm it below.
        </Text.Custom>
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
          <ResendCodeButton />
          <Text.Custom mt={3} fontSize={1} color="intent-alert">
            {error && 'Verification code was incorrect.'}
          </Text.Custom>
        </Flex>
      </Flex>
    </>
  );
}

function ResendCodeButton() {
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
          <Button.TextButton
            fontSize={1}
            fontWeight={400}
            disabled={state === 'loading'}
            onClick={resendCode}
          >
            send another code
          </Button.TextButton>
          {state === 'loading' && <Spinner ml={1} size={0} />}
        </>
      ) : (
        <Text.Custom variant="body" fontSize={1} color="intent-success">
          Another verification code was sent.
        </Text.Custom>
      )}
    </Flex>
  );
}

function SuccessScreen() {
  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Text.Custom fontSize={3}>Email successfully updated.</Text.Custom>
    </Flex>
  );
}
