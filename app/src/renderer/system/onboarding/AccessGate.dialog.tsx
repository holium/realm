import { KeyboardEventHandler, useState } from 'react';
import { Text, Flex, Label, Button, Input, Box } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';

const AccessGatePresenter = (props: BaseDialogProps) => {
  const { theme } = useServices();
  const themeData = getBaseTheme(theme.currentTheme);

  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event: any) => {
    const value = event.target.value.trim();
    setAccessCode(value);
    setError('');
  };

  const checkCode = async () => {
    setLoading(true);
    const response = await OnboardingActions.checkGatedAccess(accessCode);
    setLoading(false);

    if (!response.success) {
      return setError(response.message);
    }

    setError('');
    props.onNext && props.onNext(false);
  };

  const goToEmail = () => {
    setError('');
    props.setState &&
      props.setState({ ...props.workflowState, recoveringAccount: true });
    props.onNext && props.onNext(true);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') checkCode();
  };

  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Text fontSize={3} fontWeight={500} mb={20}>
        Invite Code
      </Text>
      <Text mt={3} fontSize={2} lineHeight="copy" variant="body">
        Access to Realm is currently invite only. If you don't already have a
        code, signup for our waitlist at holium.com
      </Text>
      <Flex mt={8} flexDirection="column">
        <Label mb={3} required={true}>
          Invite Code
        </Label>
        <Input
          value={accessCode}
          onChange={onChange}
          type="text"
          required={true}
          spellCheck={false}
          onKeyDown={onKeyDown}
        />
        <Box hidden={!error} mt={2}>
          <Text variant="body" color={themeData.colors.text.error}>
            {error}
          </Text>
        </Box>
        <Flex mt={8} width="100%">
          <Button
            width="100%"
            disabled={accessCode.length !== 21}
            isLoading={loading}
            onClick={checkCode}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
      <Flex width="100%" justifyContent="center">
        <Text
          mt={20}
          fontSize={2}
          fontWeight={400}
          color={themeData.colors.text.disabled}
          onClick={goToEmail}
        >
          Already signed up?
        </Text>
      </Flex>
    </Flex>
  );
};

export const AccessGate = observer(AccessGatePresenter);
