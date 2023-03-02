import { KeyboardEventHandler, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import emailValidator from 'email-validator';

import { Label, TextButton } from 'renderer/components';
import {
  Flex,
  Button,
  Text,
  TextInput,
  Icon,
  Spinner,
} from '@holium/design-system';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { ThemeType } from 'renderer/theme';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';

const EmailDialogPresenter = (props: BaseDialogProps) => {
  const { onboarding } = useServices();
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const [view, setView] = useState('initial');
  const done = () => props.onNext && props.onNext();

  return (
    <Flex width="100%" height="100%" flexDirection="column">
      {view === 'initial' ? (
        <InitialScreen
          done={() => setView('verify')}
          isRecoveringAccount={props.workflowState.isRecoveringAccount}
        />
      ) : (
        <VerifyScreen
          verificationCode={onboarding.verificationCode!}
          done={done}
          theme={baseTheme as ThemeType}
          newAccount={onboarding.newAccount}
        />
      )}
    </Flex>
  );
};

export const EmailDialog = observer(EmailDialogPresenter);

function InitialScreen(props: { done: any; isRecoveringAccount: boolean }) {
  const { onboarding } = useServices();
  const [email, setEmail] = useState(onboarding.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const onChange = (event: any) => setEmail(event.target.value);

  const onClick = async () => {
    setLoading(true);
    const response = await OnboardingActions.setEmail(
      email,
      props.isRecoveringAccount
    );
    setLoading(false);

    response.success ? props.done() : setError(response.errorMessage);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') onClick();
  };

  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Text.Custom fontSize={3} fontWeight={500} mb={20}>
        Email
      </Text.Custom>
      <Text.Custom fontSize={2} lineHeight="1.4">
        We need a contact email for account recovery purposes. We pledge a
        solemn oath to never share it with anyone or use it for marketing spam.
      </Text.Custom>
      <Flex mt={8} flexDirection="column">
        <Label mb={1} required={true}>
          Email
        </Label>
        <TextInput
          height={36}
          name="email-recovery"
          id="email-recovery"
          value={email}
          onChange={onChange}
          onKeyDown={onKeyDown}
          type="email"
          required={true}
        />
        <Flex flexDirection="column" mt={8} width="100%">
          <Button.Primary
            width="100%"
            py={2}
            justifyContent="center"
            disabled={!email || !emailValidator.validate(email)}
            onClick={onClick}
          >
            {loading ? <Spinner size={0} color="#FFF" /> : 'Submit'}
          </Button.Primary>
          {error && (
            <Text.Custom
              mt={4}
              fontSize={1}
              color="intent-alert"
              textAlign="center"
            >
              {error}
            </Text.Custom>
          )}
        </Flex>
        {props.isRecoveringAccount && (
          <Flex
            position="absolute"
            left={24}
            bottom={24}
            gap={4}
            flexDirection="row"
            alignItems="center"
          >
            <Button.IconButton
              size={24}
              onClick={() => {
                OnboardingActions.setStep(OnboardingStep.ACCESS_GATE);
              }}
            >
              <Icon name="ArrowLeftLine" size={20} opacity={0.5} />
            </Button.IconButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

function VerifyScreen(props: {
  theme: ThemeType;
  verificationCode: string;
  done: any;
  newAccount: boolean;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const validChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const resendCode = async () => {
    if (!props.newAccount) {
      await OnboardingActions.resendEmailConfirmation();
    }
  };

  useEffect(() => {
    resendCode();
  }, [props.newAccount]);

  const submit = async (code: string) => {
    const wasCorrect = await OnboardingActions.verifyEmail(code);
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
        <Text.Custom fontSize={2} lineHeight="1.4">
          We sent a verification code to your email. Once you receive the code,
          confirm it below.
        </Text.Custom>
      </Flex>
      <Flex flexDirection="column">
        <Flex mt={5} width="100%" justifyContent="center">
          <TextInput
            name="verification-code"
            id="verification-code"
            fontSize="20px"
            mt={7}
            height={50}
            placeholder="A1F9C5"
            textAlign="center"
            value={code}
            onChange={(evt: any) => onChange(evt.target.value)}
          />
        </Flex>
        <Flex mt={4} flexDirection="column">
          <ResendCodeButton theme={props.theme} />
          <Text.Custom mt={3} fontSize={1} color="intent-alert">
            {error && 'Verification code was incorrect.'}
          </Text.Custom>
        </Flex>
      </Flex>
    </>
  );
}

function ResendCodeButton(props: { theme: ThemeType }) {
  const [state, setState] = useState('initial');

  const resendCode = async () => {
    setState('loading');
    await OnboardingActions.resendEmailConfirmation();
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
          {state === 'loading' && <Spinner ml={1} size="8px" />}
        </>
      ) : (
        <Text.Custom fontSize={1} color="intent-success">
          Another verification code was sent.
        </Text.Custom>
      )}
    </Flex>
  );
}
